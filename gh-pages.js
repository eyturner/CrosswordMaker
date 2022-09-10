var ghpages = require('gh-pages');

ghpages.publish(
  'public', // path to public directory
  {
    branch: 'gh-pages',
    repo: 'https://github.com/eyturner/CrosswordMaker', // Update to point to your repository
    user: {
      name: 'Eli Turner', // update to use your name
      email: 'eyturner@umich.edu' // Update to use your email
    }
  },
  () => {
    console.log('Deploy Complete!')
  }
)