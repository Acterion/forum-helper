#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Processing Module for AI-Assisted Empathetic Communication Analysis
========================================================================

Contains functions for loading, cleaning, and preprocessing study data.
"""

import pandas as pd
import numpy as np
import json
from config import DEFAULT_DATA_FILE, SELF_EFFICACY_ITEMS


def safe_json_parse(json_string):
    """
    Safely parse JSON string, returning empty dict on error.
    
    Parameters:
    -----------
    json_string : str
        JSON string to parse
        
    Returns:
    --------
    dict : Parsed JSON or empty dict
    """
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return {}


def calculate_self_efficacy_composite(questions_dict, prefix):
    """
    Calculate self-efficacy composite score from individual items.
    
    Parameters:
    -----------
    questions_dict : dict
        Dictionary containing questionnaire responses
    prefix : str
        Prefix for self-efficacy items ('selfEfficacy')
        
    Returns:
    --------
    float : Composite self-efficacy score (mean of valid items)
    """
    se_items = [
        questions_dict.get(f'{prefix}{i}') for i in SELF_EFFICACY_ITEMS
    ]
    
    # Filter out None values and calculate mean
    se_valid = [x for x in se_items if x is not None]
    
    return np.mean(se_valid) if se_valid else np.nan


def process_participant_row(row):
    """
    Process a single participant row from raw data.
    
    Parameters:
    -----------
    row : pandas.Series
        Raw data row for one participant-case combination
        
    Returns:
    --------
    dict : Processed participant data
    """
    pre_questions = safe_json_parse(row['Pre Questions'])
    post_questions = safe_json_parse(row['Post Questions'])
    
    # Calculate self-efficacy composites
    pre_se_composite = calculate_self_efficacy_composite(pre_questions, 'selfEfficacy')
    post_se_composite = calculate_self_efficacy_composite(post_questions, 'selfEfficacy')
    
    # Calculate change score
    se_change = (post_se_composite - pre_se_composite 
                 if not np.isnan(pre_se_composite) and not np.isnan(post_se_composite) 
                 else np.nan)
    
    processed_row = {
        'participant_id': row['ID'],
        'branch': row['Branch'],
        'case_id': row['Case ID'],
        'sequence': row['Sequence'],
        'age': row['Age'],
        'education': row['Education'],
        'ethnicity': row['Ethnicity'],
        'time_taken': row['Time Taken'],
        
        # Self-efficacy measures
        'pre_self_efficacy': pre_se_composite,
        'post_self_efficacy': post_se_composite,
        'self_efficacy_change': se_change,
        
        # Individual self-efficacy items (for detailed analysis)
        **{f'pre_se_{i}': pre_questions.get(f'selfEfficacy{i}') for i in SELF_EFFICACY_ITEMS},
        **{f'post_se_{i}': post_questions.get(f'selfEfficacy{i}') for i in SELF_EFFICACY_ITEMS},
        
        # Case-level measures
        'pre_confidence': row['Pre Confidence'],
        'post_confidence': row['Post Confidence'],
        'post_stress': row['Post Stress'],
        
        # Intervention-specific measures
        'stress': post_questions.get('stress'),
        'want_ai_help': post_questions.get('wantAIHelp'),
        'helpfulness': post_questions.get('helpfulness'),
        'empathy': post_questions.get('empathy'),
        'actionability': post_questions.get('actionability'),
        'intention_to_adopt': post_questions.get('intentionToAdopt'),
    }
    
    return processed_row


def create_participant_summary(processed_data):
    """
    Create participant-level summary from case-level data.
    
    Parameters:
    -----------
    processed_data : pandas.DataFrame
        Case-level processed data
        
    Returns:
    --------
    pandas.DataFrame : Participant-level summary data
    """
    participant_data = []
    
    for participant_id in processed_data['participant_id'].unique():
        participant_cases = processed_data[processed_data['participant_id'] == participant_id]
        first_case = participant_cases.iloc[0]
        
        # Participant demographics (same across cases)
        participant_row = {
            'participant_id': participant_id,
            'branch': first_case['branch'],
            'group': 'AI' if first_case['branch'] == 'branch-a' else 'Control',
            'age': first_case['age'],
            'education': first_case['education'],
            'ethnicity': first_case['ethnicity'],
            
            # Pre-intervention measures (should be same across cases)
            'pre_self_efficacy': first_case['pre_self_efficacy'],
            
            # Post-intervention measures (averaged across cases)
            'post_self_efficacy': participant_cases['post_self_efficacy'].mean(),
            'post_stress': participant_cases['post_stress'].mean(),
            'avg_time_taken': participant_cases['time_taken'].mean(),
            
            # Intervention-specific (from post-study survey)
            'stress': first_case['stress'],
            'want_ai_help': first_case['want_ai_help'],
            'helpfulness': first_case['helpfulness'],
            'empathy': first_case['empathy'],
            'actionability': first_case['actionability'],
            'intention_to_adopt': first_case['intention_to_adopt'],
            
            'cases_completed': len(participant_cases)
        }
        
        # Calculate change score
        participant_row['self_efficacy_change'] = (
            participant_row['post_self_efficacy'] - participant_row['pre_self_efficacy']
        )
        
        participant_data.append(participant_row)
    
    return pd.DataFrame(participant_data)


def load_and_process_data(file_path=DEFAULT_DATA_FILE):
    """
    Load and process the study data from CSV file.
    
    Parameters:
    -----------
    file_path : str
        Path to the CSV file
        
    Returns:
    --------
    tuple : (raw_data, participant_data, processed_data)
    """
    print("🔄 Loading and processing data...")
    
    # Load raw data
    raw_data = pd.read_csv(file_path)
    
    # Process each row
    processed_rows = []
    for _, row in raw_data.iterrows():
        processed_rows.append(process_participant_row(row))
    
    # Create processed DataFrame
    processed_data = pd.DataFrame(processed_rows)
    
    # Create participant-level data (aggregating across cases)
    participant_data = create_participant_summary(processed_data)
    
    print(f"✅ Data loaded successfully!")
    print(f"   📊 {len(raw_data)} total cases from {len(participant_data)} participants")
    print(f"   🎯 {len(participant_data[participant_data['group'] == 'AI'])} AI participants")
    print(f"   🎯 {len(participant_data[participant_data['group'] == 'Control'])} Control participants")
    print(f"   📈 {participant_data['cases_completed'].mean():.1f} average cases per participant")
    
    return raw_data, participant_data, processed_data


def add_demographic_groups(data):
    """
    Add demographic grouping variables to the dataset.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        Participant data to add groupings to
        
    Returns:
    --------
    pandas.DataFrame : Data with added demographic groups
    """
    from config import AGE_BINS, AGE_LABELS
    
    data = data.copy()
    
    # Age groups
    data['age_group'] = pd.cut(data['age'], bins=AGE_BINS, labels=AGE_LABELS)
    
    return data


def get_data_summary(participant_data, case_data):
    """
    Generate summary statistics for the dataset.
    
    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level data
    case_data : pandas.DataFrame
        Case-level data
        
    Returns:
    --------
    dict : Summary statistics
    """
    ai_participants = participant_data[participant_data['group'] == 'AI']
    control_participants = participant_data[participant_data['group'] == 'Control']
    
    summary = {
        'total_participants': len(participant_data),
        'ai_participants': len(ai_participants),
        'control_participants': len(control_participants),
        'total_cases': len(case_data),
        'completion_rate': 1.0,  # Assuming 100% based on the original code
        'avg_cases_per_participant': participant_data['cases_completed'].mean(),
        'age_range': (participant_data['age'].min(), participant_data['age'].max()),
        'ai_age_mean': ai_participants['age'].mean(),
        'control_age_mean': control_participants['age'].mean()
    }
    
    return summary