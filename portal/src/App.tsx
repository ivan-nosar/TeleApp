import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Home } from "./pages/Home";
import { Signin } from "./pages/Signin";
import { Signup } from "./pages/Signup";
import { User } from "./pages/User";
import { Sessions } from "./pages/Sessions";

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
                  <Route exact path="/user/:id/apps/:appId" component={ Sessions }/>
              </Switch>
          </Router>
        );
    }
}

export default App;
