#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Visualization Module for AI-Assisted Empathetic Communication Analysis
=====================================================================

Contains all plotting functions for creating publication-ready figures.
"""

import pandas as pd
import numpy as np

# Try to import visualization libraries
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    from scipy.stats import ttest_ind
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    print("Warning: matplotlib, seaborn, or scipy not available. Visualization features disabled.")

from config import COLORS, FIGURE_FORMATS, FIGURE_DPI
from statistical_analysis import calculate_effect_size, interpret_effect_size


def require_visualization(func):
    """Decorator to check if visualization libraries are available."""
    def wrapper(*args, **kwargs):
        if not VISUALIZATION_AVAILABLE:
            print(f"❌ {func.__name__} requires matplotlib and seaborn. Please install them.")
            return None
        return func(*args, **kwargs)
    return wrapper


@require_visualization
def save_figure(fig, filename, formats=None, dpi=None):
    """
    Save figure in multiple formats for LaTeX compatibility.
    
    Parameters:
    -----------
    fig : matplotlib.figure.Figure
        Figure to save
    filename : str
        Base filename (without extension)
    formats : list
        List of formats to save (defaults to config FIGURE_FORMATS)
    dpi : int
        DPI for saving (defaults to config FIGURE_DPI)
    """
    if formats is None:
        formats = FIGURE_FORMATS
    if dpi is None:
        dpi = FIGURE_DPI
    
    for fmt in formats:
        fig.savefig(f"{filename}.{fmt}", dpi=dpi, bbox_inches='tight',
                    format=fmt, facecolor='white', edgecolor='none')
    print(f"📁 Saved: {filename}.{', '.join(formats)}")


@require_visualization
def plot_group_comparison(data, measure='self_efficacy_change', title=None, save_name=None):
    """
    Create a publication-ready group comparison plot.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    measure : str
        Column name for outcome measure
    title : str
        Plot title (optional)
    save_name : str
        Filename to save plot (optional)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Box plot with individual points
    sns.boxplot(data=data, x='group', y=measure, ax=ax1,
                palette=[COLORS['ai'], COLORS['control']])
    sns.stripplot(data=data, x='group', y=measure, ax=ax1,
                  color='black', alpha=0.6, size=4)
    
    ax1.set_title('Box Plot with Individual Points')
    ax1.set_ylabel(measure.replace('_', ' ').title())
    ax1.set_xlabel('Group')
    
    # Violin plot with means
    sns.violinplot(data=data, x='group', y=measure, ax=ax2,
                   palette=[COLORS['ai'], COLORS['control']])
    
    # Add means
    for i, group in enumerate(['AI', 'Control']):
        group_data = data[data['group'] == group][measure].dropna()
        if len(group_data) > 0:
            mean_val = group_data.mean()
            ax2.plot(i, mean_val, 'ko', markersize=8, markerfacecolor='white',
                     markeredgewidth=2, label='Mean' if i == 0 else '')
    
    ax2.set_title('Distribution Shape')
    ax2.set_ylabel(measure.replace('_', ' ').title())
    ax2.set_xlabel('Group')
    ax2.legend()
    
    # Add statistical annotation
    ai_data = data[data['group'] == 'AI'][measure].dropna()
    control_data = data[data['group'] == 'Control'][measure].dropna()
    
    if len(ai_data) > 0 and len(control_data) > 0:
        effect_size = calculate_effect_size(ai_data, control_data)
        t_stat, p_val = ttest_ind(ai_data, control_data)
        
        fig.suptitle(title or f'{measure.replace("_", " ").title()} by Group\n' +
                     f'Effect Size (d) = {effect_size:.3f} ({interpret_effect_size(effect_size)}), p = {p_val:.3f}',
                     fontsize=14, y=1.02)
    else:
        fig.suptitle(title or f'{measure.replace("_", " ").title()} by Group',
                     fontsize=14, y=1.02)
    
    plt.tight_layout()
    
    if save_name:
        save_figure(fig, save_name)
    
    return fig


@require_visualization
def plot_pre_post_comparison(data, save_name=None):
    """
    Create pre-post intervention comparison plot.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        Participant-level data with pre and post measures
    save_name : str
        Filename to save plot (optional)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Prepare data for plotting
    plot_data = []
    for _, row in data.iterrows():
        if not pd.isna(row['pre_self_efficacy']) and not pd.isna(row['post_self_efficacy']):
            plot_data.extend([
                {'Group': row['group'], 'Time': 'Pre',
                 'Score': row['pre_self_efficacy'], 'ID': row['participant_id']},
                {'Group': row['group'], 'Time': 'Post',
                 'Score': row['post_self_efficacy'], 'ID': row['participant_id']}
            ])
    
    if not plot_data:
        print("Warning: No valid pre-post data found for plotting")
        return fig
    
    plot_df = pd.DataFrame(plot_data)
    
    # Create the plot
    sns.pointplot(data=plot_df, x='Time', y='Score', hue='Group',
                  palette=[COLORS['ai'], COLORS['control']],
                  markers=['o', 's'], linestyles=['-', '--'], ax=ax)
    
    # Add individual trajectories (faded)
    for group, color in [('AI', COLORS['ai']), ('Control', COLORS['control'])]:
        group_data = data[data['group'] == group]
        for _, participant in group_data.iterrows():
            if not pd.isna(participant['pre_self_efficacy']) and not pd.isna(participant['post_self_efficacy']):
                ax.plot(['Pre', 'Post'],
                        [participant['pre_self_efficacy'], participant['post_self_efficacy']],
                        color=color, alpha=0.1, linewidth=0.5)
    
    ax.set_title('Self-Efficacy Changes: Pre to Post Intervention')
    ax.set_ylabel('Self-Efficacy Score')
    ax.set_xlabel('Time Point')
    ax.legend(title='Group')
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_name:
        save_figure(fig, save_name)
    
    return fig


@require_visualization
def plot_effect_size_forest(measures_dict, participant_data, save_name=None):
    """
    Create a forest plot of effect sizes.
    
    Parameters:
    -----------
    measures_dict : dict
        Dictionary of measure names and their effect sizes
    participant_data : pandas.DataFrame
        Participant data for confidence interval calculation
    save_name : str
        Filename to save plot (optional)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    measure_names = list(measures_dict.keys())
    effect_sizes = list(measures_dict.values())
    
    # Calculate confidence intervals (approximate)
    # For Cohen's d with equal n, SE ≈ sqrt(2/n + d²/(2*(2n-2)))
    n_approx = len(participant_data) // 2  # Approximate group size
    conf_intervals = []
    
    for d in effect_sizes:
        if n_approx > 0:
            se = np.sqrt(2/n_approx + d**2/(2*(2*n_approx-2)))
            ci_lower = d - 1.96 * se
            ci_upper = d + 1.96 * se
        else:
            ci_lower = ci_upper = d
        conf_intervals.append((ci_lower, ci_upper))
    
    y_pos = np.arange(len(measure_names))
    
    # Plot effect sizes
    colors = [COLORS['ai'] if d > 0 else COLORS['control'] for d in effect_sizes]
    ax.scatter(effect_sizes, y_pos, s=100, c=colors, alpha=0.7, zorder=3)
    
    # Plot confidence intervals
    for i, (d, (ci_lower, ci_upper)) in enumerate(zip(effect_sizes, conf_intervals)):
        ax.plot([ci_lower, ci_upper], [i, i], 'k-', alpha=0.5, linewidth=2)
    
    # Add vertical line at 0
    ax.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    
    # Formatting
    ax.set_yticks(y_pos)
    ax.set_yticklabels([name.replace('_', ' ').title() for name in measure_names])
    ax.set_xlabel("Effect Size (Cohen's d)")
    ax.set_title("Effect Sizes with 95% Confidence Intervals\n(Positive = AI Better, Negative = Control Better)")
    
    # Add effect size interpretation regions
    ax.axvspan(-0.2, 0.2, alpha=0.1, color='gray', label='Negligible')
    ax.axvspan(-0.5, -0.2, alpha=0.1, color='orange', label='Small')
    ax.axvspan(0.2, 0.5, alpha=0.1, color='orange')
    
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_name:
        save_figure(fig, save_name)
    
    return fig


@require_visualization
def plot_power_analysis(effect_sizes, max_n=1000, target_n=600, save_name=None):
    """
    Create power analysis plot for different sample sizes.
    
    Parameters:
    -----------
    effect_sizes : list or float
        Effect sizes to plot power curves for
    max_n : int
        Maximum total sample size to plot
    target_n : int
        Target sample size to highlight
    save_name : str
        Filename to save plot (optional)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    from statistical_analysis import power_analysis
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    sample_sizes = np.arange(50, max_n + 1, 50)
    
    if not isinstance(effect_sizes, list):
        effect_sizes = [effect_sizes]
    
    colors = [COLORS['ai'], COLORS['control'], COLORS['neutral']]
    
    for i, effect_size in enumerate(effect_sizes):
        power_values = []
        for n in sample_sizes:
            power_val = power_analysis(abs(effect_size), n//2)  # n/2 per group
            power_values.append(power_val)
        
        color = colors[i % len(colors)]
        ax.plot(sample_sizes, power_values, linewidth=2, color=color,
                label=f'Effect Size d = {effect_size:.3f}')
    
    # Add reference lines
    ax.axhline(y=0.8, color='red', linestyle='--', alpha=0.7, label='80% Power')
    ax.axhline(y=0.9, color='orange', linestyle='--', alpha=0.7, label='90% Power')
    if target_n <= max_n:
        ax.axvline(x=target_n, color='green', linestyle='--', alpha=0.7, 
                   label=f'Target N={target_n}')
    
    ax.set_xlabel('Total Sample Size')
    ax.set_ylabel('Statistical Power')
    ax.set_title('Power Analysis for Different Effect Sizes')
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 1)
    
    plt.tight_layout()
    
    if save_name:
        save_figure(fig, save_name)
    
    return fig


@require_visualization
def plot_correlation_matrix(data, variables, save_name=None):
    """
    Create correlation matrix heatmap.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    variables : list
        List of variable names to include in correlation matrix
    save_name : str
        Filename to save plot (optional)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    # Filter to numeric variables and remove missing data
    corr_data = data[variables].select_dtypes(include=[np.number])
    correlation_matrix = corr_data.corr()
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Create heatmap
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0,
                square=True, linewidths=0.5, cbar_kws={"shrink": 0.8}, ax=ax)
    
    ax.set_title('Correlation Matrix of Study Variables')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    if save_name:
        save_figure(fig, save_name)
    
    return fig


@require_visualization
def plot_demographics_distribution(data, demographic_var, save_name=None):
    """
    Create demographic distribution plots by group.
    
    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    demographic_var : str
        Name of demographic variable to plot
    save_name : str
        Filename to save plot (optional)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    if data[demographic_var].dtype in ['object', 'category']:
        # Categorical variable - create count plot
        sns.countplot(data=data, x=demographic_var, hue='group', ax=ax,
                      palette=[COLORS['ai'], COLORS['control']])
        ax.set_title(f'Distribution of {demographic_var.replace("_", " ").title()} by Group')
        plt.xticks(rotation=45, ha='right')
    else:
        # Continuous variable - create histogram
        for group, color in [('AI', COLORS['ai']), ('Control', COLORS['control'])]:
            group_data = data[data['group'] == group][demographic_var].dropna()
            ax.hist(group_data, alpha=0.7, label=group, color=color, bins=10)
        
        ax.set_title(f'Distribution of {demographic_var.replace("_", " ").title()} by Group')
        ax.set_xlabel(demographic_var.replace("_", " ").title())
        ax.set_ylabel('Frequency')
        ax.legend()
    
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    
    if save_name:
        save_figure(fig, save_name)
    
    return fig


@require_visualization
def quick_plot(measure, group_col='group', data=None):
    """
    Quick plotting function for exploratory analysis.
    
    Parameters:
    -----------
    measure : str
        Column name for measure to plot
    group_col : str
        Column name for grouping variable
    data : pandas.DataFrame
        Dataset (if None, will need to be passed)
        
    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    if data is None:
        raise ValueError("Data must be provided")
    
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.boxplot(data=data, x=group_col, y=measure, ax=ax)
    ax.set_title(f'{measure.replace("_", " ").title()} by {group_col.replace("_", " ").title()}')
    plt.show()
    return fig


def create_consort_diagram_data():
    """
    Create data structure for CONSORT flow diagram.
    
    Returns:
    --------
    dict : CONSORT diagram data structure
    """
    # This is a template - fill in with actual recruitment data
    consort_data = {
        'assessed_for_eligibility': 'TBD',
        'excluded': 'TBD',
        'randomized': 'TBD',
        'allocated_intervention': 'TBD',
        'allocated_control': 'TBD',
        'received_intervention': 'TBD',
        'received_control': 'TBD',
        'lost_to_followup_intervention': 0,
        'lost_to_followup_control': 0,
        'analyzed_intervention': 'TBD',
        'analyzed_control': 'TBD'
    }
    
    return consort_data