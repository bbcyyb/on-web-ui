'use strict';

import React from 'react';
import Router, { Route, Redirect, NotFoundRoute, DefaultRoute } from 'react-router';
import onReady from 'common-web-ui/lib/onReady';

// import { MenuItem } from 'material-ui';
import NotFound from 'common-web-ui/views/NotFound';
import UserLogin from 'common-web-ui/views/UserLogin';

// See http://material-ui.com/#/components/left-nav
export var navigation = [
  { text: 'Login', route: '/' },
  { text: 'Not Found', route: '404' }
];

// Must be imported after navigation.
import App from '../views/App';

// See http://rackt.github.io/react-router/
export var routes = (
  <Route name="root" path="/" handler={App}>
    <DefaultRoute handler={UserLogin} />
    <Route name="404" handler={NotFound} />
    <Route name="login" handler={UserLogin} />
    <NotFoundRoute handler={NotFound} />
    <Redirect from="home" to="/" />
  </Route>
);

// Router configuration
let params = {
  routes,
  scrollBehavior: Router.ScrollToTopBehavior
};

// Run the application when both DOM is ready and page content is loaded
onReady(() =>
  Router.create(params).run(
    Handler => React.render(<Handler />, document.body)));
