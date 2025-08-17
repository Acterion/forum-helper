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
            print(
                f"❌ {func.__name__} requires matplotlib and seaborn. Please install them.")
            return None
        return func(*args, **kwargs)
    return wrapper


def get_standard_dimension_order():
    """
    Get the standardized order for self-efficacy dimensions across all visualizations.

    Returns:
    --------
    list : Ordered list of dimension labels
    """
    return ['overall', 'empathetic', 'clear', 'appropriate', 'accurate', 'helpful', 'complete', 'relevant']


def sort_dimensions_by_standard_order(dimension_data, key_func=None):
    """
    Sort dimension data according to the standard order.

    Parameters:
    -----------
    dimension_data : list or dict
        Data to be sorted (list of dicts or dict with dimension keys)
    key_func : function, optional
        Function to extract dimension name from each item (for list input)

    Returns:
    --------
    list or dict : Sorted data in standard order
    """
    standard_order = get_standard_dimension_order()

    if isinstance(dimension_data, dict):
        # Sort dictionary by keys
        sorted_items = []
        for dim in standard_order:
            if dim in dimension_data:
                sorted_items.append((dim, dimension_data[dim]))
        return dict(sorted_items)

    elif isinstance(dimension_data, list):
        # Sort list using key function
        if key_func is None:
            # Assume items are dimension names
            return [dim for dim in standard_order if dim in dimension_data]
        else:
            # Sort items using key function
            sorted_items = []
            for dim in standard_order:
                for item in dimension_data:
                    if key_func(item) == dim:
                        sorted_items.append(item)
                        break
            return sorted_items

    return dimension_data


@require_visualization
def plot_self_efficacy_dimensions_trajectory(participant_data, output_dir=''):
    """
    Plot pre-post trajectory for each self-efficacy dimension using faceted design.
    Creates a grid with separate subplot for each dimension.

    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level data with dimension scores
    output_dir : str
        Directory to save the plot

    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    from data_processing import get_self_efficacy_dimensions

    dimensions = get_self_efficacy_dimensions()

    # Get dimensions in standard order
    standard_order = get_standard_dimension_order()
    ordered_dimensions = []

    # Add overall first if it exists in data
    if 'pre_self_efficacy' in participant_data.columns and 'post_self_efficacy' in participant_data.columns:
        ordered_dimensions.append(('overall', 'overall'))

    # Add other dimensions in standard order
    # Skip 'overall' as we already added it
    for dim_name in standard_order[1:]:
        for dim_num, dim_label in dimensions.items():
            if dim_label == dim_name:
                ordered_dimensions.append((dim_num, dim_label))
                break

    # Create a 2x4 grid (7 dimensions + 1 overall plot)
    fig, axes = plt.subplots(2, 4, figsize=(20, 12))
    axes = axes.flatten()

    # Define colors for groups
    colors = {'AI': COLORS['ai'], 'Control': COLORS['control']}

    # Plot each dimension separately in standard order
    for dim_idx, (dim_num, dim_label) in enumerate(ordered_dimensions):
        if dim_idx >= len(axes):
            break

        ax = axes[dim_idx]

        # Handle overall dimension
        if dim_label == 'overall':
            pre_col = 'pre_self_efficacy'
            post_col = 'post_self_efficacy'
            title = 'Overall'
        else:
            pre_col = f'pre_se_{dim_label}'
            post_col = f'post_se_{dim_label}'
            title = dim_label.title()

        for group in ['AI', 'Control']:
            group_data = participant_data[participant_data['group'] == group]

            if pre_col in group_data.columns and post_col in group_data.columns:
                # Calculate means and standard errors
                pre_scores = group_data[pre_col].dropna()
                post_scores = group_data[post_col].dropna()

                if len(pre_scores) > 0 and len(post_scores) > 0:
                    pre_mean = pre_scores.mean()
                    post_mean = post_scores.mean()
                    pre_se = pre_scores.std() / np.sqrt(len(pre_scores))
                    post_se = post_scores.std() / np.sqrt(len(post_scores))

                    # Add slight horizontal offset to avoid overlap
                    offset = 0.02 if group == 'AI' else -0.02

                    # Plot line with offset
                    ax.plot([0 + offset, 1 + offset], [pre_mean, post_mean],
                            color=colors[group], marker='o', linewidth=3,
                            markersize=10, label=group if dim_idx == 0 else "",
                            alpha=0.8)

                    # Add error bars
                    ax.errorbar([0 + offset, 1 + offset], [pre_mean, post_mean],
                                yerr=[pre_se, post_se],
                                color=colors[group], alpha=0.6, capsize=5,
                                linewidth=2)

                    # Add value labels
                    ax.text(0 + offset, pre_mean + 0.1, f'{pre_mean:.2f}',
                            ha='center', va='bottom', fontsize=9,
                            color=colors[group], fontweight='bold')
                    ax.text(1 + offset, post_mean + 0.1, f'{post_mean:.2f}',
                            ha='center', va='bottom', fontsize=9,
                            color=colors[group], fontweight='bold')

        # Customize each subplot
        ax.set_xlim(-0.15, 1.15)
        ax.set_ylim(0.5, 6.5)
        ax.set_xticks([0, 1])
        ax.set_xticklabels(['Pre', 'Post'], fontsize=11)
        ax.set_ylabel('Self-Efficacy Score', fontsize=11)
        ax.set_title(title, fontsize=13, fontweight='bold')
        ax.grid(True, alpha=0.3)

        # Add horizontal line at pre-intervention baseline
        group_data_all = participant_data
        if pre_col in group_data_all.columns:
            overall_pre_mean = group_data_all[pre_col].dropna().mean()
            ax.axhline(y=overall_pre_mean, color='gray',
                       linestyle=':', alpha=0.5)

    # Use the last subplot for a summary/legend
    summary_ax = axes[-1]
    summary_ax.axis('off')

    # Create summary effect sizes plot in the last subplot
    from data_processing import analyze_self_efficacy_dimensions
    try:
        dimension_results = analyze_self_efficacy_dimensions(participant_data)

        # Extract effect sizes
        dim_labels = []
        effect_sizes = []
        for dim_label, results in dimension_results.items():
            if 'error' not in results and 'effect_size' in results:
                dim_labels.append(dim_label.title())
                effect_sizes.append(results['effect_size'])

        if dim_labels:
            # Create mini bar chart
            y_pos = np.arange(len(dim_labels))
            bars = summary_ax.barh(y_pos, effect_sizes,
                                   color=[COLORS['ai'] if es > 0 else COLORS['control']
                                          for es in effect_sizes],
                                   alpha=0.7, height=0.6)

            summary_ax.set_yticks(y_pos)
            summary_ax.set_yticklabels(dim_labels, fontsize=10)
            summary_ax.set_xlabel('Effect Size', fontsize=11)
            summary_ax.set_title('Effect Sizes\n(Cohen\'s d)',
                                 fontsize=12, fontweight='bold')
            summary_ax.axvline(x=0, color='black', linestyle='-', alpha=0.5)
            summary_ax.grid(True, alpha=0.3, axis='x')

            # Add effect size values
            for bar, es in zip(bars, effect_sizes):
                summary_ax.text(es + 0.02 if es > 0 else es - 0.02,
                                bar.get_y() + bar.get_height()/2,
                                f'{es:.3f}',
                                ha='left' if es > 0 else 'right',
                                va='center', fontsize=9, fontweight='bold')

    except Exception as e:
        summary_ax.text(0.5, 0.5, f'Effect sizes\ncalculation error:\n{str(e)[:50]}...',
                        ha='center', va='center', transform=summary_ax.transAxes,
                        fontsize=10)

    # Overall title and legend
    fig.suptitle('Self-Efficacy Dimensions: Pre-Post Trajectories by Group',
                 fontsize=18, fontweight='bold', y=0.95)

    # Add overall legend
    if len(dimensions) > 0:
        legend_elements = [
            plt.Line2D([0], [0], color=colors['AI'], linewidth=3, marker='o',
                       markersize=8, label=f'AI Group (n={len(participant_data[participant_data["group"] == "AI"])})'),
            plt.Line2D([0], [0], color=colors['Control'], linewidth=3, marker='o',
                       markersize=8, label=f'Control Group (n={len(participant_data[participant_data["group"] == "Control"])})')
        ]
        fig.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.02),
                   ncol=2, fontsize=12)

    plt.tight_layout()
    plt.subplots_adjust(top=0.9, bottom=0.1)

    # Save figure
    if output_dir:
        save_figure(fig, f'{output_dir}/figure_se_dimensions_trajectory')

    return fig


@require_visualization
def plot_self_efficacy_dimensions_change(participant_data, output_dir=''):
    """
    Plot change scores for each self-efficacy dimension by group.

    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level data with dimension change scores
    output_dir : str
        Directory to save the plot

    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    from data_processing import get_self_efficacy_dimensions

    dimensions = get_self_efficacy_dimensions()
    standard_order = get_standard_dimension_order()

    fig, ax = plt.subplots(figsize=(14, 8))

    # Prepare data for plotting in standard order
    plot_data = []
    ordered_dimensions = []

    # Add overall if it exists
    if 'self_efficacy_change' in participant_data.columns:
        ordered_dimensions.append(('overall', 'overall'))

    # Add other dimensions in standard order
    for dim_name in standard_order[1:]:  # Skip 'overall'
        for dim_num, dim_label in dimensions.items():
            if dim_label == dim_name:
                ordered_dimensions.append((dim_num, dim_label))
                break

    for dim_num, dim_label in ordered_dimensions:
        if dim_label == 'overall':
            change_col = 'self_efficacy_change'
            display_name = 'Overall'
        else:
            change_col = f'se_change_{dim_label}'
            display_name = dim_label.title()

        if change_col in participant_data.columns:
            for group in ['AI', 'Control']:
                group_data = participant_data[participant_data['group'] == group]
                change_scores = group_data[change_col].dropna()

                for score in change_scores:
                    plot_data.append({
                        'dimension': display_name,
                        'group': group,
                        'change_score': score
                    })

    plot_df = pd.DataFrame(plot_data)

    if len(plot_df) > 0:
        # Create box plot with standard order
        dimension_order = [name for _, name in ordered_dimensions if name ==
                           'overall' or name in [d[1] for d in ordered_dimensions]]
        dimension_order = ['Overall'] + [d.title()
                                         for _, d in ordered_dimensions if d != 'overall']

        sns.boxplot(data=plot_df, x='dimension', y='change_score', hue='group',
                    palette=[COLORS['ai'], COLORS['control']], ax=ax,
                    order=dimension_order)

        # Add horizontal line at zero
        ax.axhline(y=0, color='black', linestyle='--', alpha=0.5)

        # Customize plot
        ax.set_xlabel('Self-Efficacy Dimension', fontsize=12)
        ax.set_ylabel('Change Score (Pre - Post)', fontsize=12)
        ax.set_title('Self-Efficacy Change by Dimension and Group',
                     fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)

        # Rotate x-axis labels for better readability
        plt.xticks(rotation=45, ha='right')

        # Add sample sizes to legend
        ai_n = len(participant_data[participant_data['group'] == 'AI'])
        control_n = len(
            participant_data[participant_data['group'] == 'Control'])

        handles, labels = ax.get_legend_handles_labels()
        new_labels = [f'AI (n={ai_n})', f'Control (n={control_n})']
        ax.legend(handles, new_labels, title='Group')

    plt.tight_layout()

    # Save figure
    if output_dir:
        save_figure(fig, f'{output_dir}/figure_se_dimensions_change')

    return fig


@require_visualization
def plot_self_efficacy_dimensions_effect_sizes(dimension_results, output_dir=''):
    """
    Plot effect sizes for each self-efficacy dimension.

    Parameters:
    -----------
    dimension_results : dict
        Results from analyze_self_efficacy_dimensions function
    output_dir : str
        Directory to save the plot

    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    fig, ax = plt.subplots(figsize=(12, 8))

    # Extract data for plotting in standard order
    standard_order = get_standard_dimension_order()

    dimensions = []
    effect_sizes = []
    p_values = []
    significance = []

    # Process dimensions in standard order
    for dim_name in standard_order:
        if dim_name in dimension_results:
            results = dimension_results[dim_name]
            if 'error' not in results and 'effect_size' in results:
                display_name = 'Overall' if dim_name == 'overall' else dim_name.title()
                dimensions.append(display_name)
                effect_sizes.append(results['effect_size'])
                p_val = results.get('recommended_p', results.get(
                    't_test', {}).get('p_value', 1.0))
                p_values.append(p_val)
                significance.append('*' if p_val < 0.05 else '')

    if dimensions:
        # Reverse order for horizontal bar plot (so 'Overall' appears at top)
        dimensions = dimensions[::-1]
        effect_sizes = effect_sizes[::-1]
        p_values = p_values[::-1]
        significance = significance[::-1]

        # Create horizontal bar plot
        y_pos = np.arange(len(dimensions))
        bars = ax.barh(y_pos, effect_sizes,
                       color=[COLORS['ai'] if es > 0 else COLORS['control']
                              for es in effect_sizes],
                       alpha=0.7)

        # Add vertical line at zero
        ax.axvline(x=0, color='black', linestyle='-', alpha=0.5)

        # Add effect size magnitude lines
        ax.axvline(x=0.2, color='gray', linestyle='--',
                   alpha=0.3, label='Small effect')
        ax.axvline(x=0.5, color='gray', linestyle='--',
                   alpha=0.5, label='Medium effect')
        ax.axvline(x=0.8, color='gray', linestyle='--',
                   alpha=0.7, label='Large effect')
        ax.axvline(x=-0.2, color='gray', linestyle='--', alpha=0.3)
        ax.axvline(x=-0.5, color='gray', linestyle='--', alpha=0.5)
        ax.axvline(x=-0.8, color='gray', linestyle='--', alpha=0.7)

        # Customize plot
        ax.set_yticks(y_pos)
        ax.set_yticklabels(dimensions)
        ax.set_xlabel('Effect Size (Cohen\'s d)', fontsize=12)
        ax.set_ylabel('Self-Efficacy Dimension', fontsize=12)
        ax.set_title('Effect Sizes: AI vs Control by Self-Efficacy Dimension',
                     fontsize=14, fontweight='bold')

        # Add significance annotations
        for i, (bar, sig) in enumerate(zip(bars, significance)):
            if sig:
                ax.text(bar.get_width() + 0.02 if bar.get_width() > 0 else bar.get_width() - 0.02,
                        bar.get_y() + bar.get_height()/2, sig,
                        ha='left' if bar.get_width() > 0 else 'right',
                        va='center', fontsize=14, fontweight='bold')

        # Add effect size values
        for i, (bar, es) in enumerate(zip(bars, effect_sizes)):
            ax.text(bar.get_width()/2 if abs(bar.get_width()) > 0.1 else (0.15 if bar.get_width() > 0 else -0.15),
                    bar.get_y() + bar.get_height()/2, f'{es:.3f}',
                    ha='center', va='center', fontweight='bold',
                    color='white' if abs(bar.get_width()) > 0.1 else 'black')

        ax.legend(loc='lower right')
        ax.grid(True, alpha=0.3, axis='x')

    plt.tight_layout()

    # Save figure
    if output_dir:
        save_figure(fig, f'{output_dir}/figure_se_dimensions_effect_sizes')

    return fig


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
                        [participant['pre_self_efficacy'],
                            participant['post_self_efficacy']],
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
    colors = [COLORS['ai'] if d > 0 else COLORS['control']
              for d in effect_sizes]
    ax.scatter(effect_sizes, y_pos, s=100, c=colors, alpha=0.7, zorder=3)

    # Plot confidence intervals
    for i, (d, (ci_lower, ci_upper)) in enumerate(zip(effect_sizes, conf_intervals)):
        ax.plot([ci_lower, ci_upper], [i, i], 'k-', alpha=0.5, linewidth=2)

    # Add vertical line at 0
    ax.axvline(x=0, color='black', linestyle='--', alpha=0.5)

    # Formatting
    ax.set_yticks(y_pos)
    ax.set_yticklabels([name.replace('_', ' ').title()
                       for name in measure_names])
    ax.set_xlabel("Effect Size (Cohen's d)")
    ax.set_title(
        "Effect Sizes with 95% Confidence Intervals\n(Positive = AI Better, Negative = Control Better)")

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
    ax.axhline(y=0.8, color='red', linestyle='--',
               alpha=0.7, label='80% Power')
    ax.axhline(y=0.9, color='orange', linestyle='--',
               alpha=0.7, label='90% Power')
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
        ax.set_title(
            f'Distribution of {demographic_var.replace("_", " ").title()} by Group')
        plt.xticks(rotation=45, ha='right')
    else:
        # Continuous variable - create histogram
        for group, color in [('AI', COLORS['ai']), ('Control', COLORS['control'])]:
            group_data = data[data['group'] == group][demographic_var].dropna()
            ax.hist(group_data, alpha=0.7, label=group, color=color, bins=10)

        ax.set_title(
            f'Distribution of {demographic_var.replace("_", " ").title()} by Group')
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
    ax.set_title(
        f'{measure.replace("_", " ").title()} by {group_col.replace("_", " ").title()}')
    return fig


@require_visualization
def plot_baseline_comparison(participant_data, output_dir=''):
    """
    Create comprehensive baseline comparison between groups to check randomization balance.

    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level data with baseline scores
    output_dir : str
        Directory to save the plot

    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """
    from data_processing import get_self_efficacy_dimensions

    dimensions = get_self_efficacy_dimensions()

    # Create figure with subplots: 2 rows x 4 columns (7 dimensions + overall)
    fig, axes = plt.subplots(2, 4, figsize=(16, 10))
    axes = axes.flatten()

    # Set style
    plt.style.use('default')

    # Colors for groups
    colors = [COLORS['ai'], COLORS['control']]  # Blue for AI, Pink for Control

    # Plot baseline scores for each dimension
    plot_idx = 0

    # Individual dimensions
    for dimension_num, dimension_label in dimensions.items():
        pre_col = f'pre_se_{dimension_label}'

        if pre_col in participant_data.columns:
            ax = axes[plot_idx]

            # Create box plot
            ai_data = participant_data[participant_data['group']
                                       == 'AI'][pre_col].dropna()
            control_data = participant_data[participant_data['group']
                                            == 'Control'][pre_col].dropna()

            # Box plot
            box_data = [ai_data, control_data]
            bp = ax.boxplot(box_data, patch_artist=True,
                            labels=['AI', 'Control'])

            # Color the boxes
            for patch, color in zip(bp['boxes'], colors):
                patch.set_facecolor(color)
                patch.set_alpha(0.7)

            # Add statistics
            from scipy.stats import ttest_ind, mannwhitneyu

            if len(ai_data) > 0 and len(control_data) > 0:
                t_stat, p_val = ttest_ind(ai_data, control_data)
                effect_size = calculate_effect_size(ai_data, control_data)

                # Add statistical annotation
                ax.text(0.5, 0.95, f'p = {p_val:.3f}\nd = {effect_size:.3f}',
                        transform=ax.transAxes, ha='center', va='top',
                        bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))

                # Add mean values
                ax.text(1, np.mean(ai_data), f'{np.mean(ai_data):.2f}',
                        ha='center', va='bottom', fontweight='bold')
                ax.text(2, np.mean(control_data), f'{np.mean(control_data):.2f}',
                        ha='center', va='bottom', fontweight='bold')

            ax.set_title(f'{dimension_label.title()}',
                         fontsize=12, fontweight='bold')
            ax.set_ylabel('Self-Efficacy Score')
            ax.grid(True, alpha=0.3)

            plot_idx += 1

    # Overall baseline self-efficacy
    if plot_idx < len(axes):
        ax = axes[plot_idx]

        ai_overall = participant_data[participant_data['group']
                                      == 'AI']['pre_self_efficacy'].dropna()
        control_overall = participant_data[participant_data['group']
                                           == 'Control']['pre_self_efficacy'].dropna()

        box_data = [ai_overall, control_overall]
        bp = ax.boxplot(box_data, patch_artist=True, labels=['AI', 'Control'])

        for patch, color in zip(bp['boxes'], colors):
            patch.set_facecolor(color)
            patch.set_alpha(0.7)

        if len(ai_overall) > 0 and len(control_overall) > 0:
            t_stat, p_val = ttest_ind(ai_overall, control_overall)
            effect_size = calculate_effect_size(ai_overall, control_overall)

            ax.text(0.5, 0.95, f'p = {p_val:.3f}\nd = {effect_size:.3f}',
                    transform=ax.transAxes, ha='center', va='top',
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))

            ax.text(1, np.mean(ai_overall), f'{np.mean(ai_overall):.2f}',
                    ha='center', va='bottom', fontweight='bold')
            ax.text(2, np.mean(control_overall), f'{np.mean(control_overall):.2f}',
                    ha='center', va='bottom', fontweight='bold')

        ax.set_title('Overall Baseline\n(Mean of All Dimensions)',
                     fontsize=12, fontweight='bold')
        ax.set_ylabel('Self-Efficacy Score')
        ax.grid(True, alpha=0.3)

        plot_idx += 1

    # Hide unused subplots
    for i in range(plot_idx, len(axes)):
        axes[i].set_visible(False)

    plt.tight_layout()
    plt.suptitle('Baseline Self-Efficacy Comparison: Checking Randomization Balance',
                 fontsize=16, fontweight='bold', y=0.98)

    # Save the plot
    if output_dir:
        for fmt in FIGURE_FORMATS:
            filename = f'figure_baseline_comparison.{fmt}'
            filepath = f'{output_dir}/{filename}' if output_dir else filename
            plt.savefig(filepath, dpi=FIGURE_DPI, bbox_inches='tight')
        print(f"📁 Saved: {output_dir}/figure_baseline_comparison.pdf, png")

    return fig


@require_visualization
def analyze_baseline_differences(participant_data):
    """
    Analyze and report baseline differences between groups.

    Parameters:
    -----------
    participant_data : pandas.DataFrame
        Participant-level data with baseline scores

    Returns:
    --------
    pandas.DataFrame : Statistical comparison of baselines
    """
    from data_processing import get_self_efficacy_dimensions
    from scipy.stats import ttest_ind

    dimensions = get_self_efficacy_dimensions()
    baseline_results = []

    # Analyze each dimension
    for dimension_num, dimension_label in dimensions.items():
        pre_col = f'pre_se_{dimension_label}'

        if pre_col in participant_data.columns:
            ai_data = participant_data[participant_data['group']
                                       == 'AI'][pre_col].dropna()
            control_data = participant_data[participant_data['group']
                                            == 'Control'][pre_col].dropna()

            if len(ai_data) > 0 and len(control_data) > 0:
                # Statistical test
                t_stat, p_val = ttest_ind(ai_data, control_data)
                effect_size = calculate_effect_size(ai_data, control_data)

                baseline_results.append({
                    'dimension': dimension_label,
                    'ai_n': len(ai_data),
                    'ai_mean': ai_data.mean(),
                    'ai_std': ai_data.std(),
                    'control_n': len(control_data),
                    'control_mean': control_data.mean(),
                    'control_std': control_data.std(),
                    'mean_difference': ai_data.mean() - control_data.mean(),
                    'effect_size': effect_size,
                    'p_value': p_val,
                    'significant': p_val < 0.05
                })

    # Overall baseline
    ai_overall = participant_data[participant_data['group']
                                  == 'AI']['pre_self_efficacy'].dropna()
    control_overall = participant_data[participant_data['group']
                                       == 'Control']['pre_self_efficacy'].dropna()

    if len(ai_overall) > 0 and len(control_overall) > 0:
        t_stat, p_val = ttest_ind(ai_overall, control_overall)
        effect_size = calculate_effect_size(ai_overall, control_overall)

        baseline_results.append({
            'dimension': 'overall',
            'ai_n': len(ai_overall),
            'ai_mean': ai_overall.mean(),
            'ai_std': ai_overall.std(),
            'control_n': len(control_overall),
            'control_mean': control_overall.mean(),
            'control_std': control_overall.std(),
            'mean_difference': ai_overall.mean() - control_overall.mean(),
            'effect_size': effect_size,
            'p_value': p_val,
            'significant': p_val < 0.05
        })

    return pd.DataFrame(baseline_results)


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


@require_visualization
def plot_baseline_adjusted_comparison(adjusted_results, output_dir=''):
    """
    Create visualization comparing raw vs baseline-adjusted effect sizes.

    Parameters:
    -----------
    adjusted_results : dict
        Results from baseline-adjusted analysis
    output_dir : str
        Directory to save the plot

    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """

    # Extract data for plotting in standard order
    standard_order = get_standard_dimension_order()
    plot_data = []

    # Process in standard order
    for dim_name in standard_order:
        if dim_name in adjusted_results:
            results = adjusted_results[dim_name]
            if 'error' not in results:
                display_name = 'Overall' if dim_name == 'overall' else dim_name.title()
                plot_data.append({
                    'dimension': display_name,
                    'raw_effect_size': results.get('raw_effect_size', 0),
                    'adjusted_effect_size': results.get('adjusted_effect_size', 0),
                    'significant': results.get('significant', False),
                    'baseline_difference': results.get('baseline_difference', 0)
                })

    if not plot_data:
        print("No data available for baseline-adjusted comparison plot")
        return None

    # Reverse order for plotting (so Overall appears at top)
    plot_data = plot_data[::-1]

    # Create figure with single subplot
    fig, ax = plt.subplots(1, 1, figsize=(10, 8))

    # Forest plot comparing raw vs adjusted effect sizes
    dimensions = [item['dimension'] for item in plot_data]
    raw_effects = [item['raw_effect_size'] for item in plot_data]
    adjusted_effects = [item['adjusted_effect_size'] for item in plot_data]

    y_positions = np.arange(len(dimensions))

    # Plot raw effect sizes
    ax.scatter(raw_effects, y_positions + 0.1, color='#A23B72', s=80,
               alpha=0.8, label='Raw Effect Size', marker='o')

    # Plot adjusted effect sizes (all non-significant, so use same color)
    ax.scatter(adjusted_effects, y_positions - 0.1, color='#2E86AB', s=80,
               alpha=0.8, marker='o', label='Baseline-Adjusted')

    # Connect raw and adjusted with lines
    for i in range(len(dimensions)):
        ax.plot([raw_effects[i], adjusted_effects[i]],
                [y_positions[i] + 0.1, y_positions[i] - 0.1],
                color='gray', alpha=0.5, linewidth=1)

    # Add effect size interpretation regions
    ax.axvspan(-0.8, -0.5, alpha=0.1, color='red', label='Large Negative')
    ax.axvspan(-0.5, -0.2, alpha=0.1, color='orange',
               label='Small-Medium Negative')
    ax.axvspan(-0.2, 0.2, alpha=0.1, color='lightgray', label='Negligible')
    ax.axvspan(0.2, 0.5, alpha=0.1, color='lightgreen',
               label='Small-Medium Positive')
    ax.axvspan(0.5, 0.8, alpha=0.1, color='green', label='Large Positive')

    ax.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax.set_yticks(y_positions)
    ax.set_yticklabels(dimensions)
    ax.set_xlabel('Effect Size (Cohen\'s d)')
    ax.set_title('Raw vs Baseline-Adjusted Effect Sizes',
                 fontweight='bold', fontsize=14)
    ax.grid(True, alpha=0.3)

    # Custom legend (removed significant category since none exist)
    from matplotlib.lines import Line2D
    legend_elements = [
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#A23B72',
               markersize=8, label='Raw Effect Size'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#2E86AB',
               markersize=8, label='Baseline-Adjusted')
    ]
    ax.legend(handles=legend_elements, loc='upper right')

    # Adjust layout to prevent title overlap
    plt.tight_layout()
    plt.subplots_adjust(top=0.92)  # Leave space for title

    # Save the plot
    if output_dir:
        for fmt in FIGURE_FORMATS:
            filename = f'figure_baseline_adjusted_effects.{fmt}'
            filepath = f'{output_dir}/{filename}' if output_dir else filename
            plt.savefig(filepath, dpi=FIGURE_DPI, bbox_inches='tight')
        print(
            f"📁 Saved: {output_dir}/figure_baseline_adjusted_effects.pdf, png")

    return fig


@require_visualization
def plot_baseline_adjusted_summary_table(adjusted_results, output_dir=''):
    """
    Create a summary table visualization of baseline-adjusted results.

    Parameters:
    -----------
    adjusted_results : dict
        Results from baseline-adjusted analysis
    output_dir : str
        Directory to save the plot

    Returns:
    --------
    matplotlib.figure.Figure : The created figure
    """

    # Extract data for table
    table_data = []
    for dim_label, results in adjusted_results.items():
        if 'error' not in results:
            table_data.append([
                dim_label.title(),
                f"{results.get('raw_effect_size', 0):.3f}",
                f"{results.get('adjusted_effect_size', 0):.3f}",
                f"{results.get('baseline_difference', 0):.3f}",
                f"{results.get('adjusted_p_value', results.get('ancova_p_value', 1.0)):.3f}",
                "Yes" if results.get('significant', False) else "No"
            ])

    if not table_data:
        print("No data available for baseline-adjusted summary table")
        return None

    fig, ax = plt.subplots(figsize=(14, len(table_data) * 0.6 + 2))
    ax.axis('tight')
    ax.axis('off')

    # Create table
    columns = ['Dimension', 'Raw d', 'Adjusted d',
               'Baseline Δ', 'Adj. p-value', 'Significant']

    # Color code rows based on significance
    cell_colors = []
    for row in table_data:
        if row[5] == "Yes":  # Significant
            cell_colors.append(['#ffcccc'] * len(columns))  # Light red
        else:
            cell_colors.append(['white'] * len(columns))

    table = ax.table(cellText=table_data, colLabels=columns,
                     cellLoc='center', loc='center',
                     cellColours=cell_colors)

    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1.2, 1.8)

    # Style the header
    for i in range(len(columns)):
        table[(0, i)].set_facecolor('#4472C4')
        table[(0, i)].set_text_props(weight='bold', color='white')

    plt.title('Baseline-Adjusted Analysis Summary\n' +
              'Controlling for Pre-Intervention Self-Efficacy Scores',
              fontsize=14, fontweight='bold', pad=20)

    # Add footnote
    plt.figtext(0.5, 0.02,
                'Note: Baseline Δ = AI group baseline mean - Control group baseline mean\n' +
                'Negative adjusted effect sizes indicate lower post-intervention scores for AI group after controlling for baseline',
                ha='center', fontsize=9, style='italic')

    # Save the plot
    if output_dir:
        for fmt in FIGURE_FORMATS:
            filename = f'table_baseline_adjusted_summary.{fmt}'
            filepath = f'{output_dir}/{filename}' if output_dir else filename
            plt.savefig(filepath, dpi=FIGURE_DPI, bbox_inches='tight')
        print(
            f"📁 Saved: {output_dir}/table_baseline_adjusted_summary.pdf, png")

    return fig
