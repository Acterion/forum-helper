#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuration and Constants for AI-Assisted Empathetic Communication Analysis
============================================================================

Contains all configuration parameters, color schemes, and plotting settings.
"""

import warnings
warnings.filterwarnings('ignore')

# Try to import visualization libraries
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    print("Warning: matplotlib and/or seaborn not available. Visualization features will be limited.")

# ============================================================================
# VISUALIZATION CONFIGURATION
# ============================================================================

# Color scheme for groups
COLORS = {
    'ai': '#667eea',
    'control': '#ff7b7b',
    'neutral': '#95a5a6'
}

# Visualization styling (only if libraries are available)
if VISUALIZATION_AVAILABLE:
    plt.style.use('default')
    sns.set_palette("husl")

# LaTeX export settings
PLOT_CONFIG = {
    'font.size': 12,
    'font.family': 'serif',
    'font.serif': ['Times New Roman'],
    'text.usetex': False,  # Set to True if you have LaTeX installed
    'figure.figsize': (10, 6),
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.format': 'pdf',
    'savefig.bbox': 'tight',
    'axes.linewidth': 1.2,
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.grid': True,
    'grid.alpha': 0.3
}

if VISUALIZATION_AVAILABLE:
    plt.rcParams.update(PLOT_CONFIG)

# ============================================================================
# ANALYSIS PARAMETERS
# ============================================================================

# Statistical significance level
ALPHA = 0.05

# Default file paths
DEFAULT_DATA_FILE = 'output.csv'

# Self-efficacy item indices
SELF_EFFICACY_ITEMS = list(range(1, 8))

# Age group bins
AGE_BINS = [0, 25, 35, 100]
AGE_LABELS = ['18-25', '26-35', '36+']

# Minimum sample size for subgroup analysis
MIN_SUBGROUP_SIZE = 10

# ============================================================================
# OUTPUT CONFIGURATION
# ============================================================================

# Default figure formats for export
FIGURE_FORMATS = ['pdf', 'png']

# Figure DPI for high-quality exports
FIGURE_DPI = 300

# File naming patterns
OUTPUT_FILES = {
    'descriptive_table': 'table_descriptives.tex',
    'demographics_table': 'table_demographics.tex',
    'results_summary': 'results_summary.txt',
    'self_efficacy_plot': 'figure_1_self_efficacy_change',
    'stress_plot': 'figure_2_post_stress',
    'pre_post_plot': 'figure_3_pre_post_trajectory',
    'effect_sizes_plot': 'figure_4_effect_sizes',
    'power_analysis_plot': 'power_analysis'
}

# ============================================================================
# STUDY METADATA
# ============================================================================

STUDY_INFO = {
    'title': 'AI-Assisted Empathetic Communication: Pilot Study Analysis',
    'author': 'Research Team',
    'date': 'June 2025',
    'description': 'Effects of AI assistance on self-efficacy and stress in empathetic communication'
}

# ============================================================================
# EFFECT SIZE INTERPRETATION
# ============================================================================

EFFECT_SIZE_THRESHOLDS = {
    'negligible': 0.2,
    'small': 0.5,
    'medium': 0.8
}

EFFECT_SIZE_LABELS = {
    'negligible': 'Negligible',
    'small': 'Small', 
    'medium': 'Medium',
    'large': 'Large'
}