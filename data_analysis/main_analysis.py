#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main Analysis Script for AI-Assisted Empathetic Communication Analysis
=====================================================================

Primary orchestration script that brings together all analysis modules
to run the complete analysis pipeline.
"""

import sys
import warnings
import argparse
from pathlib import Path

# Import our modules
from config import OUTPUT_FILES, STUDY_INFO
from data_processing import load_and_process_data, add_demographic_groups, get_data_summary
from statistical_analysis import run_statistical_tests, analyze_subgroups, power_analysis
from visualization import (
    plot_group_comparison, plot_pre_post_comparison, plot_effect_size_forest,
    plot_power_analysis, plot_demographics_distribution
)
from export_utils import (
    export_publication_materials, create_analysis_report, 
    print_file_list, create_results_summary
)

warnings.filterwarnings('ignore')


def print_header():
    """Print analysis header information."""
    print("📊 " + STUDY_INFO['title'])
    print("=" * 60)
    print(f"Author: {STUDY_INFO['author']}")
    print(f"Study: {STUDY_INFO['description']}")
    print("=" * 60)


def run_primary_analysis(participant_data, output_dir='.'):
    """
    Run the primary analysis pipeline.
    
    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level dataset
    output_dir : str
        Directory for output files
        
    Returns:
    --------
    dict : Analysis results
    """
    print("\n" + "="*60)
    print("🔬 PRIMARY ANALYSIS PIPELINE")
    print("="*60)
    
    results = {}
    
    # 1. Descriptive Statistics
    print("\n📊 1. DESCRIPTIVE STATISTICS")
    print("-" * 40)
    
    from export_utils import create_descriptive_table
    desc_table = create_descriptive_table(
        participant_data, 
        measures=['self_efficacy_change', 'post_stress'] if 'post_stress' in participant_data.columns 
        else ['self_efficacy_change']
    )
    print(desc_table.to_string(index=False))
    results['descriptives'] = desc_table
    
    # 2. Statistical Tests
    print("\n🧮 2. STATISTICAL TESTS")
    print("-" * 40)
    
    # Self-efficacy change
    se_results = run_statistical_tests(
        participant_data, measure_col='self_efficacy_change')
    
    print(f"Self-Efficacy Change:")
    print(f"  Effect Size (Cohen's d): {se_results['effect_size']:.3f} " +
          f"({se_results.get('interpretation', 'Unknown')})")
    print(f"  t-test: t = {se_results['t_test']['statistic']:.3f}, " +
          f"p = {se_results['t_test']['p_value']:.3f}")
    print(f"  Mann-Whitney U: U = {se_results['mann_whitney']['statistic']:.1f}, " +
          f"p = {se_results['mann_whitney']['p_value']:.3f}")
    
    results['self_efficacy_results'] = se_results
    
    # Post-stress (if available)
    stress_results = None
    if 'post_stress' in participant_data.columns:
        stress_results = run_statistical_tests(
            participant_data, measure_col='post_stress')
        
        print(f"\nPost-Intervention Stress:")
        print(f"  Effect Size (Cohen's d): {stress_results['effect_size']:.3f}")
        print(f"  t-test: t = {stress_results['t_test']['statistic']:.3f}, " +
              f"p = {stress_results['t_test']['p_value']:.3f}")
        
        results['stress_results'] = stress_results
    
    # 3. Create Visualizations
    print("\n📈 3. CREATING VISUALIZATIONS")
    print("-" * 40)
    
    figures = []
    
    # Primary outcome plot
    fig1 = plot_group_comparison(
        participant_data, 'self_efficacy_change',
        'Primary Outcome: Self-Efficacy Change',
        f"{output_dir}/{OUTPUT_FILES['self_efficacy_plot']}"
    )
    figures.append(fig1)
    
    # Secondary outcome plot (if available)
    if 'post_stress' in participant_data.columns:
        fig2 = plot_group_comparison(
            participant_data, 'post_stress',
            'Secondary Outcome: Post-Intervention Stress',
            f"{output_dir}/{OUTPUT_FILES['stress_plot']}"
        )
        figures.append(fig2)
    
    # Pre-post comparison
    if 'pre_self_efficacy' in participant_data.columns and 'post_self_efficacy' in participant_data.columns:
        fig3 = plot_pre_post_comparison(
            participant_data, 
            f"{output_dir}/{OUTPUT_FILES['pre_post_plot']}"
        )
        figures.append(fig3)
    
    # Effect size forest plot
    effect_sizes = {'self_efficacy_change': se_results['effect_size']}
    if stress_results:
        effect_sizes['post_stress'] = stress_results['effect_size']
    
    fig4 = plot_effect_size_forest(
        effect_sizes, participant_data,
        f"{output_dir}/{OUTPUT_FILES['effect_sizes_plot']}"
    )
    figures.append(fig4)
    
    results['figures'] = figures
    
    print("✅ Primary analysis complete!")
    
    return results


def run_secondary_analyses(participant_data, case_data=None, output_dir='.'):
    """
    Run secondary and exploratory analyses.
    
    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level dataset
    case_data : pandas.DataFrame
        Case-level dataset (optional)
    output_dir : str
        Directory for output files
        
    Returns:
    --------
    dict : Secondary analysis results
    """
    print("\n" + "="*60)
    print("🔍 SECONDARY ANALYSES")
    print("="*60)
    
    results = {}
    
    # 1. Demographic subgroup analyses
    print("\n👥 1. DEMOGRAPHIC SUBGROUP ANALYSES")
    print("-" * 40)
    
    # Add demographic grouping variables
    participant_data_grouped = add_demographic_groups(participant_data)
    
    # Age group analysis
    if 'age_group' in participant_data_grouped.columns:
        age_results = analyze_subgroups(
            participant_data_grouped, 'age_group', 'self_efficacy_change'
        )
        
        for age_group, result in age_results.items():
            if 'error' not in result:
                print(f"  Age group {age_group}: d = {result['effect_size']:.3f}")
            else:
                print(f"  Age group {age_group}: {result['error']}")
        
        results['age_subgroups'] = age_results
    
    # 2. Power analysis for full study
    print("\n⚡ 2. POWER ANALYSIS")
    print("-" * 40)
    
    # Get pilot effect size
    se_results = run_statistical_tests(participant_data, measure_col='self_efficacy_change')
    pilot_effect_size = abs(se_results['effect_size'])
    
    # Power for target sample size (N=600)
    power_600 = power_analysis(pilot_effect_size, 300)  # 300 per group
    print(f"Power for N=600 (300 per group): {power_600:.3f}")
    
    # Create power analysis plot
    fig_power = plot_power_analysis(
        [pilot_effect_size], max_n=1000, target_n=600,
        save_name=f"{output_dir}/{OUTPUT_FILES['power_analysis_plot']}"
    )
    
    results['power_analysis'] = {'power_600': power_600, 'figure': fig_power}
    
    # 3. Demographics visualization
    print("\n📊 3. DEMOGRAPHICS VISUALIZATION")
    print("-" * 40)
    
    # Age distribution
    if 'age' in participant_data.columns:
        fig_age = plot_demographics_distribution(
            participant_data, 'age', f"{output_dir}/demographics_age"
        )
        results['demographics_plots'] = [fig_age]
    
    print("✅ Secondary analyses complete!")
    
    return results


def run_export_pipeline(participant_data, case_data=None, output_dir='.'):
    """
    Run the export and reporting pipeline.
    
    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level dataset
    case_data : pandas.DataFrame
        Case-level dataset (optional)
    output_dir : str
        Directory for output files
        
    Returns:
    --------
    dict : Exported file paths
    """
    print("\n" + "="*60)
    print("📄 EXPORT AND REPORTING")
    print("="*60)
    
    # Export all publication materials
    exported_files = export_publication_materials(participant_data, output_dir)
    
    # Create comprehensive analysis report
    report_path = create_analysis_report(participant_data, case_data, output_dir)
    if report_path:
        exported_files['report'] = report_path
    
    # Print file list
    print_file_list(exported_files)
    
    return exported_files


def main():
    """Main analysis function."""
    parser = argparse.ArgumentParser(
        description='Run AI-Assisted Empathetic Communication Analysis'
    )
    parser.add_argument(
        '--data', default='output.csv',
        help='Path to data file (default: output.csv)'
    )
    parser.add_argument(
        '--output', default='.',
        help='Output directory (default: current directory)'
    )
    parser.add_argument(
        '--skip-secondary', action='store_true',
        help='Skip secondary analyses'
    )
    parser.add_argument(
        '--skip-export', action='store_true',
        help='Skip export pipeline'
    )
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    output_dir = Path(args.output)
    output_dir.mkdir(exist_ok=True)
    
    # Print header
    print_header()
    
    try:
        # Load and process data
        print("\n🔄 LOADING DATA")
        print("-" * 40)
        raw_data, participant_data, case_data = load_and_process_data(args.data)
        
        # Print data summary
        summary = get_data_summary(participant_data, case_data)
        print(f"📊 Data Summary:")
        for key, value in summary.items():
            print(f"   {key.replace('_', ' ').title()}: {value}")
        
        # Run primary analysis
        primary_results = run_primary_analysis(participant_data, str(output_dir))
        
        # Run secondary analyses (unless skipped)
        secondary_results = {}
        if not args.skip_secondary:
            secondary_results = run_secondary_analyses(
                participant_data, case_data, str(output_dir)
            )
        
        # Run export pipeline (unless skipped)
        exported_files = {}
        if not args.skip_export:
            exported_files = run_export_pipeline(
                participant_data, case_data, str(output_dir)
            )
        
        # Final summary
        print("\n" + "="*60)
        print("✅ ANALYSIS COMPLETE!")
        print("="*60)
        
        print("\n📋 NEXT STEPS FOR FULL STUDY")
        print("-" * 40)
        print("1. Review baseline imbalances - consider stratified randomization")
        print("2. Calculate precise power for N=600 using observed effect sizes")
        print("3. Consider stress as co-primary outcome given promising results")
        print("4. Examine interaction patterns in AI group for mechanism insights")
        print("5. Plan subgroup analyses for demographics and baseline characteristics")
        
        print(f"\n📁 Output saved to: {output_dir}")
        print("\n🎯 Ready for manuscript preparation and full study planning!")
        
        return {
            'primary_results': primary_results,
            'secondary_results': secondary_results,
            'exported_files': exported_files,
            'data': {
                'raw_data': raw_data,
                'participant_data': participant_data,
                'case_data': case_data
            }
        }
        
    except FileNotFoundError:
        print(f"❌ Error: Data file '{args.data}' not found.")
        print("   Please check the file path and try again.")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    # Allow running from command line or importing as module
    if len(sys.argv) > 1:
        main()
    else:
        # Interactive mode - load data and provide access to functions
        print_header()
        print("\n🔧 INTERACTIVE MODE")
        print("-" * 40)
        print("Loading data and making functions available...")
        
        try:
            raw_data, participant_data, case_data = load_and_process_data()
            print("✅ Data loaded successfully!")
            print("\nAvailable for interactive use:")
            print("- raw_data, participant_data, case_data")
            print("- All analysis functions from imported modules")
            print("\nExample usage:")
            print("  results = run_primary_analysis(participant_data)")
            print("  quick_plot('self_efficacy_change', data=participant_data)")
            
        except FileNotFoundError:
            print("❌ Default data file 'output.csv' not found.")
            print("   Use command line mode with --data flag to specify file path.")
        except Exception as e:
            print(f"❌ Error loading data: {e}")