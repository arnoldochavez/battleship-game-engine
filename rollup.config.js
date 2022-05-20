export default [
    {    
        input: 'src/main.js',
        output: {
            file: 'dist/bge.js',
            name: 'BGE',
            format: 'umd'
        }
    },
    {
        input: 'src/main.js',
        output: {
            file: 'dist/bge.module.js',
            format: 'esm'
        }
    }
];