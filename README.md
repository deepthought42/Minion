[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c7cb0073a1814667a40879dc093ea8a5)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=deepthought42/Minion&amp;utm_campaign=Badge_Grade)

# Qanairy UI (aka Minion)

This project is the User Interface(Client) layer for the Qanairy API.

## Getting Started

To get you started you can simply clone the Minion repository and install the dependencies:

### Prerequisites

You need git to clone the [Minion](https://github.com/deepthought42/Minion.git) repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test Minion. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone Minion

Clone the Minion repository using [git][git]:

```
git clone https://github.com/deepthought42/Minion.git
cd Minion/app
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

*  We get the tools we depend upon via `npm`, the [node package manager][npm].
*  We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

*  `node_modules` - contains the npm packages for the tools we need
*  `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
Minion changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000`.
