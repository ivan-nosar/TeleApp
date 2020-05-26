import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Home } from "./pages/Home";
import { Signin } from "./pages/Signin";
import { Signup } from "./pages/Signup";
import { User } from "./pages/User";
import { Sessions } from "./pages/Sessions";
import { GettingStarted } from "./pages/GettingStarted";
import { Logs } from "./pages/Logs";
import { Metrics } from "./pages/Metrics";

const history = createBrowserHistory();

class App extends React.Component {

    render() {
        return (
          <Router history={history}>
              <Switch>
                  <Route exact path="/" component={ Home }/>
                  <Route exact path="/sign-in" component={ Signin }/>
                  <Route exact path="/sign-up" component={ Signup }/>
                  <Route exact path="/user" component={ User }/>
                  <Route exact path="/user/:id" component={ User }/>
                  <Route exact path="/user/:id/apps/:appId" component={ GettingStarted }/>
                  <Route exact path="/user/:id/apps/:appId/sessions" component={ Sessions }/>
                  <Route exact path="/user/:id/apps/:appId/logs" component={ Logs }/>
                  <Route exact path="/user/:id/apps/:appId/metrics" component={ Metrics }/>
              </Switch>
          </Router>
        );
    }
}

export default App;
