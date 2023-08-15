export default {
  // Set the base directory for GitHub pages
  base: process.env.NODE_ENV === 'production' ? '/simcity-threejs-clone/' : '/',

  // Set the project root directory (relative to the config file)
  root: './src',

  // Set the directory to serve static files from (relative to the root)
  publicDir: './public',
  
  // Set the build output directory
  build: {
    outDir: './dist'
  }
}