# AI-Assisted Empathetic Communication Analysis

A modular analysis pipeline for analyzing randomized controlled trial data on the effects of AI assistance on self-efficacy and stress in empathetic communication.

## Overview

This project has been refactored from a single monolithic `analysis.py` file into several semantic modules for better organization, maintainability, and ease of use.

## Project Structure

### Core Modules

- **`config.py`** - Configuration and constants
  - Color schemes, plotting settings
  - Analysis parameters (significance levels, thresholds)
  - Output file configurations
  - Study metadata

- **`data_processing.py`** - Data loading and preprocessing
  - CSV data loading and cleaning
  - JSON parsing for questionnaire responses
  - Self-efficacy composite score calculation
  - Participant-level data aggregation
  - Demographic grouping utilities

- **`statistical_analysis.py`** - Statistical testing and analysis
  - Descriptive statistics calculation
  - Effect size computations (Cohen's d, Hedges' g, Glass' delta)
  - Statistical tests (t-tests, Mann-Whitney U, etc.)
  - Assumption testing (normality, homoscedasticity)
  - Subgroup analyses
  - Power analysis utilities

- **`visualization.py`** - Plotting and visualization
  - Publication-ready group comparison plots
  - Pre-post intervention trajectory plots
  - Effect size forest plots
  - Power analysis curves
  - Demographics distribution plots
  - Correlation matrices

- **`export_utils.py`** - Export and reporting
  - LaTeX table generation
  - Results summary creation
  - Publication-ready text sections
  - Comprehensive analysis reports
  - File export management

- **`main_analysis.py`** - Primary orchestration script
  - Complete analysis pipeline
  - Command-line interface
  - Interactive mode support
  - Progress tracking and reporting

### Utility Files

- **`test_modules.py`** - Module testing script
- **`README.md`** - This documentation

## Installation and Requirements

### Required Dependencies
```bash
pip install pandas numpy scipy
```

### Optional Dependencies (for visualization)
```bash
pip install matplotlib seaborn
```

**Note:** The analysis modules will work without visualization libraries, but plotting functions will be disabled.

## Usage

### Command Line Interface

Run the complete analysis pipeline:
```bash
python main_analysis.py --data output.csv --output results/
```

Options:
- `--data PATH` - Path to data file (default: output.csv)
- `--output DIR` - Output directory (default: current directory)
- `--skip-secondary` - Skip secondary analyses
- `--skip-export` - Skip export pipeline

### Interactive Mode

Load the modules for interactive analysis:
```python
python main_analysis.py  # No arguments for interactive mode
```

Or import directly:
```python
from data_processing import load_and_process_data
from statistical_analysis import run_statistical_tests
from visualization import plot_group_comparison

# Load data
raw_data, participant_data, case_data = load_and_process_data('your_data.csv')

# Run statistical tests
results = run_statistical_tests(participant_data)

# Create visualizations
fig = plot_group_comparison(participant_data, 'self_efficacy_change')
```

## Key Features

### Robust Error Handling
- Graceful handling of missing visualization libraries
- Safe JSON parsing with error recovery
- Validation of data requirements

### Publication Ready
- LaTeX-compatible figure exports
- APA-style statistical reporting
- Professional table formatting
- Comprehensive documentation

### Modular Design
- Clear separation of concerns
- Easy to extend and modify
- Reusable components
- Independent module testing

### Flexible Usage
- Command-line and interactive modes
- Configurable output options
- Optional secondary analyses
- Customizable parameters

## Testing

Run the test suite to verify all modules are working:
```bash
python test_modules.py
```

## Migration from Original `analysis.py`

The original monolithic `analysis.py` file has been split as follows:

| Original Section | New Module |
|------------------|------------|
| Setup and imports | `config.py` |
| Data loading and preprocessing | `data_processing.py` |
| Statistical analysis functions | `statistical_analysis.py` |
| Visualization functions | `visualization.py` |
| Export functions for LaTeX | `export_utils.py` |
| Main analysis pipeline | `main_analysis.py` |

All functionality from the original file is preserved, with improved organization and additional features.