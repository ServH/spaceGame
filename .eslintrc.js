module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'script'
    },
    globals: {
        // Game globals
        CONFIG: 'readonly',
        Utils: 'readonly',
        PerformanceManager: 'readonly',
        EventSystem: 'readonly',
        StateManager: 'readonly',
        DependencyInjector: 'readonly',
        
        // Core systems
        GameEngine: 'readonly',
        Game: 'readonly',
        
        // Game systems
        ResourceManager: 'readonly',
        Buildings: 'readonly',
        BuildingManager: 'readonly',
        AI: 'readonly',
        
        // Entities
        Planet: 'readonly',
        Fleet: 'readonly',
        FleetManager: 'readonly',
        
        // UI systems
        UI: 'readonly',
        ResourceUI: 'readonly',
        BuildingUI: 'readonly',
        Animations: 'readonly',
        UIFeedback: 'readonly',
        
        // Input systems
        InputManager: 'readonly',
        MouseHandler: 'readonly',
        KeyboardHandler: 'readonly',
        
        // Config
        BalanceConfig: 'readonly',
        
        // Debug utilities
        debugGame: 'readonly',
        debugPerformance: 'readonly'
    },
    rules: {
        // Code Quality Rules
        'no-unused-vars': ['warn', { 
            'vars': 'all', 
            'args': 'after-used',
            'varsIgnorePattern': '^_',
            'argsIgnorePattern': '^_'
        }],
        'no-console': 'off', // Allow console for game logging
        'no-debugger': 'warn',
        'no-alert': 'warn',
        
        // Best Practices
        'eqeqeq': ['error', 'always'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unused-expressions': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-useless-return': 'error',
        'prefer-promise-reject-errors': 'error',
        'radix': 'error',
        'yoda': 'error',
        
        // Variables
        'no-delete-var': 'error',
        'no-label-var': 'error',
        'no-restricted-globals': 'error',
        'no-shadow': 'warn',
        'no-shadow-restricted-names': 'error',
        'no-undef': 'error',
        'no-undef-init': 'error',
        'no-use-before-define': ['error', { 'functions': false, 'classes': true }],
        
        // Stylistic Issues
        'array-bracket-spacing': ['error', 'never'],
        'block-spacing': 'error',
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'camelcase': ['warn', { 'properties': 'never' }],
        'comma-dangle': ['error', 'never'],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'comma-style': ['error', 'last'],
        'computed-property-spacing': ['error', 'never'],
        'consistent-this': ['error', 'self'],
        'eol-last': 'error',
        'func-call-spacing': ['error', 'never'],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
        'keyword-spacing': ['error', { 'before': true, 'after': true }],
        'linebreak-style': ['error', 'unix'],
        'max-len': ['warn', { 'code': 120, 'ignoreComments': true, 'ignoreStrings': true }],
        'new-cap': ['error', { 'newIsCap': true, 'capIsNew': false }],
        'new-parens': 'error',
        'no-array-constructor': 'error',
        'no-lonely-if': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
        'no-new-object': 'error',
        'no-spaced-func': 'error',
        'no-trailing-spaces': 'error',
        'no-unneeded-ternary': 'error',
        'no-whitespace-before-property': 'error',
        'object-curly-spacing': ['error', 'always'],
        'one-var': ['error', 'never'],
        'operator-assignment': ['error', 'always'],
        'operator-linebreak': ['error', 'before'],
        'padded-blocks': ['error', 'never'],
        'quote-props': ['error', 'as-needed'],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'semi': ['error', 'always'],
        'semi-spacing': ['error', { 'before': false, 'after': true }],
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', 'never'],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'space-unary-ops': ['error', { 'words': true, 'nonwords': false }],
        'spaced-comment': ['error', 'always'],
        
        // ES6
        'arrow-spacing': ['error', { 'before': true, 'after': true }],
        'constructor-super': 'error',
        'generator-star-spacing': ['error', { 'before': false, 'after': true }],
        'no-class-assign': 'error',
        'no-confusing-arrow': 'error',
        'no-const-assign': 'error',
        'no-dupe-class-members': 'error',
        'no-duplicate-imports': 'error',
        'no-new-symbol': 'error',
        'no-restricted-imports': 'error',
        'no-this-before-super': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'no-var': 'warn',
        'object-shorthand': ['error', 'always'],
        'prefer-arrow-callback': 'warn',
        'prefer-const': 'warn',
        'prefer-destructuring': ['warn', { 'object': true, 'array': false }],
        'prefer-rest-params': 'warn',
        'prefer-spread': 'warn',
        'prefer-template': 'warn',
        'rest-spread-spacing': ['error', 'never'],
        'symbol-description': 'error',
        'template-curly-spacing': 'error',
        'yield-star-spacing': ['error', 'after']
    }
}; 