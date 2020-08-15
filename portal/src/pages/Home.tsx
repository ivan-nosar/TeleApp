import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { checkSigning } from "../helpers/signing";
import { makeStyles } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import logo from "../app-center-hero.svg";

const useStyles = makeStyles((theme: any) => ({
    paper: {
        height: "60%",
        lineHeight: "100%",
        position: "absolute",
        top: "30%",
        padding: theme.spacing(3)
    },
    grid: {
        height: "100%", // Fix IE 11 issue.
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    errorMessage: {
        color: "red"
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    blue: {
        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
        border: 0,
        borderRadius: 3,
        boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
        color: "white",
        height: 48,
        padding: "0 30px",
        margin: 8,
    },
    red: {
        background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
        border: 0,
        borderRadius: 3,
        boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
        color: "white",
        height: 48,
        padding: "0 30px",
        margin: 8,
    },
}));

function FormRow() {
    const classes = useStyles();
    return (
      <React.Fragment>
        <Grid item xs={6}>
            <div className={classes.paper}>
                <Typography component="h1" variant="h3">
                    Welcome to TeleApp
                </Typography>
                <Typography component="h1" variant="h4">
                    Collect your app usage data gracefully
                </Typography>
            </div>
        </Grid>
        <Grid item xs={6}>
            <br/>
            <br/>
            <br/>
            <br/>
          <img src={logo} alt=""/>
        </Grid>
      </React.Fragment>
    );
}

export function Home() {
    useEffect(() => {
        document.title = "TeleApp | Collect your app usage data gracefully";
    });

    const classes = useStyles();

    if (checkSigning()) {
        return <Redirect to="/user" />;
    }

    return (
        <div >
            <AppBar>
                <Toolbar>
                    <Typography component="h1" variant="h5" className={classes.title}>
                        TeleApp
                    </Typography>
                    <Button href="/sign-in" className={classes.blue}>Sign in</Button >
                    <Button href="/sign-up" className={classes.red}>Get started</Button >
                </Toolbar>
            </AppBar>

            <br/>
            <br/>
            <br/>
            <Grid container>
                <Grid container item xs={12}>
                    <FormRow />
                </Grid>
            </Grid>
        </div>
    );
}
