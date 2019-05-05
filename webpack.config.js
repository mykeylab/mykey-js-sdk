module.exports = {
    entry: ['./src/index'],
    output: {
      filename: 'bundle.js'
    },
    resolve: {
      modules:[
        'node_modules'
       ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ],
              plugins:[
                '@babel/plugin-transform-runtime'
              ]
            }
          },
          exclude: /node_modules/
        }
      ]
  }
};
