module.exports = function (api) {
  const isTesting = api.env('test')
  
  if (isTesting) {
    return {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
    }
  }
  
  return {
    presets: ['babel-preset-expo'],
  }
}