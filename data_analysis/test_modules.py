#!/usr/bin/env python3
"""
Test script for the refactored analysis modules.
"""

def test_imports():
    """Test that all modules can be imported."""
    print("Testing module imports...")
    
    try:
        import config
        print("✅ config imported")
        
        import data_processing 
        print("✅ data_processing imported")
        
        import statistical_analysis
        print("✅ statistical_analysis imported")
        
        import visualization
        print("✅ visualization imported")
        
        import export_utils
        print("✅ export_utils imported")
        
        import main_analysis
        print("✅ main_analysis imported")
        
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality without real data."""
    print("\nTesting basic functionality...")
    
    try:
        # Test configuration access
        from config import COLORS, ALPHA
        print(f"✅ Config constants accessible: COLORS has {len(COLORS)} entries, ALPHA={ALPHA}")
        
        # Test data processing utilities
        from data_processing import safe_json_parse
        test_json = '{"test": "value"}'
        parsed = safe_json_parse(test_json)
        print(f"✅ JSON parsing works: {parsed}")
        
        # Test statistical utilities
        from statistical_analysis import interpret_effect_size
        interpretation = interpret_effect_size(0.5)
        print(f"✅ Effect size interpretation works: d=0.5 is {interpretation}")
        
        # Test export utilities (without real data)
        from export_utils import OUTPUT_FILES
        print(f"✅ Export configuration accessible: {len(OUTPUT_FILES)} output files defined")
        
        return True
    except Exception as e:
        print(f"❌ Functionality test failed: {e}")
        return False

def test_with_dummy_data():
    """Test with minimal dummy data."""
    print("\nTesting with dummy data...")
    
    try:
        import pandas as pd
        import numpy as np
        from statistical_analysis import calculate_descriptive_stats, run_statistical_tests
        
        # Create minimal dummy data
        dummy_data = pd.DataFrame({
            'group': ['AI'] * 5 + ['Control'] * 5,
            'self_efficacy_change': np.random.normal(0, 1, 10),
            'age': np.random.randint(18, 65, 10)
        })
        
        # Test descriptive statistics
        desc_stats = calculate_descriptive_stats(dummy_data)
        print(f"✅ Descriptive statistics calculated: {desc_stats.shape}")
        
        # Test statistical tests
        results = run_statistical_tests(dummy_data)
        print(f"✅ Statistical tests completed: effect size = {results['effect_size']:.3f}")
        
        # Test visualization (should show warning if matplotlib not available)
        from visualization import plot_group_comparison
        fig = plot_group_comparison(dummy_data)
        if fig is None:
            print("ℹ️  Visualization skipped (matplotlib not available)")
        else:
            print("✅ Visualization created successfully")
        
        return True
    except Exception as e:
        print(f"❌ Dummy data test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 TESTING REFACTORED ANALYSIS MODULES")
    print("=" * 60)
    
    all_passed = True
    
    # Test imports
    all_passed &= test_imports()
    
    # Test basic functionality
    all_passed &= test_basic_functionality()
    
    # Test with dummy data
    all_passed &= test_with_dummy_data()
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ The refactored modules are working correctly")
    else:
        print("❌ SOME TESTS FAILED")
        print("ℹ️  Check the output above for details")
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    main()