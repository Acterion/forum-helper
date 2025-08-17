#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Statistical Analysis Module for AI-Assisted Empathetic Communication Analysis
============================================================================

Contains all statistical testing functions, effect size calculations, and analysis utilities.
"""

import pandas as pd
import numpy as np
import scipy.stats as stats
from scipy.stats import ttest_ind, ttest_rel, mannwhitneyu, wilcoxon, shapiro, levene
from config import ALPHA, EFFECT_SIZE_THRESHOLDS, EFFECT_SIZE_LABELS


def calculate_descriptive_stats(data, group_col='group', measure_col='self_efficacy_change'):
    """
    Calculate descriptive statistics by group.

    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    group_col : str
        Column name for grouping variable
    measure_col : str
        Column name for outcome measure

    Returns:
    --------
    pandas.DataFrame : Descriptive statistics by group
    """
    stats_dict = {}
    for group in data[group_col].unique():
        group_data = data[data[group_col] == group][measure_col].dropna()

        stats_dict[group] = {
            'n': len(group_data),
            'mean': group_data.mean(),
            'std': group_data.std(),
            'median': group_data.median(),
            'q25': group_data.quantile(0.25),
            'q75': group_data.quantile(0.75),
            'min': group_data.min(),
            'max': group_data.max()
        }

    return pd.DataFrame(stats_dict).T


def calculate_effect_size(group1, group2, method='cohen_d'):
    """
    Calculate effect size between two groups.

    Parameters:
    -----------
    group1 : array-like
        First group data
    group2 : array-like  
        Second group data
    method : str
        Effect size method ('cohen_d', 'glass_delta', 'hedges_g')

    Returns:
    --------
    float : Effect size value
    """
    if method == 'cohen_d':
        pooled_std = np.sqrt(((len(group1) - 1) * group1.var() +
                             (len(group2) - 1) * group2.var()) /
                             (len(group1) + len(group2) - 2))
        return (group1.mean() - group2.mean()) / pooled_std

    elif method == 'glass_delta':
        return (group1.mean() - group2.mean()) / group2.std()

    elif method == 'hedges_g':
        cohen_d = calculate_effect_size(group1, group2, 'cohen_d')
        correction = 1 - (3 / (4 * (len(group1) + len(group2)) - 9))
        return cohen_d * correction


def interpret_effect_size(d):
    """
    Interpret Cohen's d effect size using standard conventions.

    Parameters:
    -----------
    d : float
        Effect size value

    Returns:
    --------
    str : Effect size interpretation
    """
    abs_d = abs(d)
    if abs_d < EFFECT_SIZE_THRESHOLDS['negligible']:
        return EFFECT_SIZE_LABELS['negligible']
    elif abs_d < EFFECT_SIZE_THRESHOLDS['small']:
        return EFFECT_SIZE_LABELS['small']
    elif abs_d < EFFECT_SIZE_THRESHOLDS['medium']:
        return EFFECT_SIZE_LABELS['medium']
    else:
        return EFFECT_SIZE_LABELS['large']


def test_normality(data, group_col='group', measure_col='self_efficacy_change'):
    """
    Test normality assumption for each group.

    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    group_col : str
        Column name for grouping variable
    measure_col : str
        Column name for outcome measure

    Returns:
    --------
    dict : Normality test results for each group
    """
    normality_results = {}

    for group in data[group_col].unique():
        group_data = data[data[group_col] == group][measure_col].dropna()
        if len(group_data) >= 3:  # Minimum for Shapiro-Wilk test
            stat, p_value = shapiro(group_data)
            normality_results[group] = {
                'statistic': stat,
                'p_value': p_value,
                'is_normal': p_value > ALPHA
            }
        else:
            normality_results[group] = {
                'statistic': np.nan,
                'p_value': np.nan,
                'is_normal': None
            }

    return normality_results


def test_homoscedasticity(data, group_col='group', measure_col='self_efficacy_change'):
    """
    Test equal variances assumption using Levene's test.

    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    group_col : str
        Column name for grouping variable
    measure_col : str
        Column name for outcome measure

    Returns:
    --------
    dict : Levene's test results
    """
    groups = []
    for group in data[group_col].unique():
        group_data = data[data[group_col] == group][measure_col].dropna()
        groups.append(group_data)

    if len(groups) >= 2 and all(len(g) > 0 for g in groups):
        stat, p_value = levene(*groups)
        return {
            'statistic': stat,
            'p_value': p_value,
            'equal_variances': p_value > ALPHA
        }
    else:
        return {
            'statistic': np.nan,
            'p_value': np.nan,
            'equal_variances': None
        }


def run_statistical_tests(data, group_col='group', measure_col='self_efficacy_change'):
    """
    Run comprehensive statistical tests comparing groups.

    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    group_col : str
        Column name for grouping variable
    measure_col : str
        Column name for outcome measure

    Returns:
    --------
    dict : Comprehensive statistical test results
    """
    # Separate groups - assuming binary comparison for now
    groups = data[group_col].unique()
    if len(groups) != 2:
        raise ValueError(f"Expected 2 groups, got {len(groups)}: {groups}")

    group1_data = data[data[group_col] == groups[0]][measure_col].dropna()
    group2_data = data[data[group_col] == groups[1]][measure_col].dropna()

    results = {}

    # Descriptive statistics
    results['descriptives'] = calculate_descriptive_stats(
        data, group_col, measure_col)

    # Effect sizes
    results['effect_size'] = calculate_effect_size(
        group1_data, group2_data, 'cohen_d')
    results['hedges_g'] = calculate_effect_size(
        group1_data, group2_data, 'hedges_g')
    results['glass_delta'] = calculate_effect_size(
        group1_data, group2_data, 'glass_delta')

    # Statistical tests
    # Independent t-test
    t_stat, t_p = ttest_ind(group1_data, group2_data)
    results['t_test'] = {
        'statistic': t_stat,
        'p_value': t_p,
        'significant': t_p < ALPHA
    }

    # Mann-Whitney U test (non-parametric alternative)
    u_stat, u_p = mannwhitneyu(
        group1_data, group2_data, alternative='two-sided')
    results['mann_whitney'] = {
        'statistic': u_stat,
        'p_value': u_p,
        'significant': u_p < ALPHA
    }

    # Assumption testing
    results['normality'] = test_normality(data, group_col, measure_col)
    results['homoscedasticity'] = test_homoscedasticity(
        data, group_col, measure_col)

    # Recommended test based on assumptions
    normality_ok = all(
        result.get('is_normal', False)
        for result in results['normality'].values()
        if result.get('is_normal') is not None
    )

    equal_var_ok = results['homoscedasticity'].get('equal_variances', False)

    if normality_ok and equal_var_ok:
        results['recommended_test'] = 't_test'
        results['recommended_p'] = results['t_test']['p_value']
    else:
        results['recommended_test'] = 'mann_whitney'
        results['recommended_p'] = results['mann_whitney']['p_value']

    return results


def paired_samples_test(data, pre_col, post_col, participant_col='participant_id'):
    """
    Run paired samples t-test for pre-post comparisons.

    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    pre_col : str
        Column name for pre-intervention measure
    post_col : str
        Column name for post-intervention measure
    participant_col : str
        Column name for participant identifier

    Returns:
    --------
    dict : Paired samples test results
    """
    # Remove rows with missing data in either pre or post
    complete_data = data[[participant_col, pre_col, post_col]].dropna()

    pre_scores = complete_data[pre_col]
    post_scores = complete_data[post_col]
    differences = post_scores - pre_scores

    results = {}

    # Descriptive statistics
    results['n_pairs'] = len(complete_data)
    results['pre_mean'] = pre_scores.mean()
    results['pre_std'] = pre_scores.std()
    results['post_mean'] = post_scores.mean()
    results['post_std'] = post_scores.std()
    results['difference_mean'] = differences.mean()
    results['difference_std'] = differences.std()

    # Paired t-test
    t_stat, p_value = ttest_rel(pre_scores, post_scores)
    results['paired_t_test'] = {
        'statistic': t_stat,
        'p_value': p_value,
        'significant': p_value < ALPHA
    }

    # Wilcoxon signed-rank test (non-parametric alternative)
    w_stat, w_p = wilcoxon(pre_scores, post_scores)
    results['wilcoxon'] = {
        'statistic': w_stat,
        'p_value': w_p,
        'significant': w_p < ALPHA
    }

    # Effect size for paired samples (Cohen's d_z)
    results['effect_size_dz'] = differences.mean() / differences.std()

    return results


def analyze_subgroups(data, subgroup_col, outcome_col='self_efficacy_change',
                      group_col='group', min_size=None):
    """
    Analyze treatment effects within demographic subgroups.

    Parameters:
    -----------
    data : pandas.DataFrame
        Dataset containing the variables
    subgroup_col : str
        Column name for subgroup variable
    outcome_col : str
        Column name for outcome measure
    group_col : str
        Column name for treatment group variable
    min_size : int
        Minimum subgroup size for analysis

    Returns:
    --------
    dict : Subgroup analysis results
    """
    from config import MIN_SUBGROUP_SIZE
    if min_size is None:
        min_size = MIN_SUBGROUP_SIZE

    subgroup_results = {}

    for subgroup in data[subgroup_col].unique():
        if pd.isna(subgroup):
            continue

        subset = data[data[subgroup_col] == subgroup]

        if len(subset) >= min_size:
            try:
                results = run_statistical_tests(subset, group_col, outcome_col)
                subgroup_results[subgroup] = results
            except ValueError as e:
                subgroup_results[subgroup] = {'error': str(e)}
        else:
            subgroup_results[subgroup] = {
                'error': f'Insufficient sample size (n={len(subset)}, min={min_size})'
            }

    return subgroup_results


def calculate_confidence_interval(data, confidence_level=0.95):
    """
    Calculate confidence interval for mean.

    Parameters:
    -----------
    data : array-like
        Data for which to calculate CI
    confidence_level : float
        Confidence level (default 0.95 for 95% CI)

    Returns:
    --------
    tuple : (lower_bound, upper_bound)
    """
    data = np.array(data)
    data = data[~np.isnan(data)]  # Remove NaN values

    if len(data) == 0:
        return (np.nan, np.nan)

    mean = np.mean(data)
    sem = stats.sem(data)  # Standard error of the mean

    # Calculate critical value for t-distribution
    df = len(data) - 1
    alpha = 1 - confidence_level
    t_critical = stats.t.ppf(1 - alpha/2, df)

    margin_of_error = t_critical * sem

    return (mean - margin_of_error, mean + margin_of_error)


def power_analysis(effect_size, sample_size_per_group, alpha=None):
    """
    Calculate statistical power for two-sample t-test.

    Parameters:
    -----------
    effect_size : float
        Expected effect size (Cohen's d)
    sample_size_per_group : int
        Sample size per group
    alpha : float
        Significance level (defaults to config ALPHA)

    Returns:
    --------
    float : Statistical power
    """
    if alpha is None:
        alpha = ALPHA

    try:
        # Using scipy's power calculation
        power = stats.ttest_power(
            effect_size, sample_size_per_group, alpha, alternative='two-sided')
        return power
    except AttributeError:
        # Fallback if ttest_power not available
        # Note: stats is already imported at module level

        # Approximate power calculation
        # This is a simplified version - for production use, consider statsmodels.stats.power
        z_alpha = stats.norm.ppf(1 - alpha/2)
        z_beta = stats.norm.ppf(1 - 0.2)  # Assuming 80% power target

        n = sample_size_per_group
        delta = effect_size

        # Approximate power
        z_score = delta * np.sqrt(n/2) - z_alpha
        power = stats.norm.cdf(z_score)

        return max(0, min(1, power))  # Bound between 0 and 1
