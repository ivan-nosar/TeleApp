import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import { Redirect } from "react-router-dom";
import * as superagent from "superagent";
import { checkSigning, storeToken } from "../helpers/signing";

const useStyles = makeStyles((theme: any) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    errorMessage: {
        color: "red"
    }
}));

interface State {
    username: string;
    email: string;
    password: string;
    remember: boolean;
    usernameError?: string;
    emailError?: string;
    passwordError?: string;
    processing: boolean;
    redirect: boolean;
    invalidLoginInformation: string;
}

export function Signup() {
    const classes = useStyles();

    const [values, setValues] = React.useState<State>({
        username: "",
        email: "",
        password: "",
        remember: false,
        usernameError: undefined,
        passwordError: undefined,
        processing: false,
        redirect: false,
        invalidLoginInformation: ""
    });

    useEffect(() => {
        document.title = "TeleApp | Sign in";
    });

    if (values.redirect || checkSigning()) {
        return <Redirect to="/user" />;
    }

    const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.checked });
    };

    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
            Sign up
            </Typography>
            <form
                className={classes.form}
                onSubmit={ (event: React.FormEvent) => onSubmit(event, values, setValues) }
                noValidate>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="User Name"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={values.username}
                    onChange={handleChange("username")}
                    error={!!values.usernameError}
                    helperText={values.usernameError}
                />
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    value={values.email}
                    onChange={handleChange("email")}
                    error={!!values.emailError}
                    helperText={values.emailError}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange("password")}
                    error={!!values.passwordError}
                    helperText={values.passwordError}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            name="remember"
                            checked={values.remember}
                            onChange={handleCheckboxChange} />
                    }
                    label="Remember me"
                />
                { values.invalidLoginInformation &&
                    <p className={classes.errorMessage}>{values.invalidLoginInformation}</p>
                }
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}>
                    Sign In
                </Button>
                <Grid container justify="flex-end">
                    <Grid item>
                        <Link href="/sign-in" variant="body2">
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </form>
        </div>
        </Container>
    );
}

async function onSubmit(
    event: React.FormEvent,
    values: State,
    setState: (state: State) => void
) {
    event.preventDefault();

    const errors: any = {
        usernameError: undefined,
        passwordError: undefined
    };
    if (values.username === "") {
        errors.usernameError = "Invalid username format";
    }
    const emailValidator = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
    if (!emailValidator.test(values.email)) {
        errors.emailError = "Invalid email format";
    }
    if (values.password === "") {
        errors.passwordError = "Invalid password format";
    }

    if (errors.passwordError || errors.usernameError) {
        setState(errors);
    } else {
        signinCallback(values, setState);
    }
}

async function signinCallback(values: State, setState: (state: State) => void) {
    const body = {
        username: values.username,
        email: values.email,
        password: values.password
    };
    try {
        const response = await superagent
            .post("http://localhost:4939/users")
            .send(body);
        if (response.status !== 200) {
            setState({ invalidLoginInformation: response.body.message } as any);
            return;
        }

        delete body["email"];

        const authResponse = await superagent
            .post("http://localhost:4939/auth")
            .send(body);
        if (authResponse.status !== 200) {
            setState({ invalidLoginInformation: "Invalid credentials provided. Please try again" } as any);
            return;
        }

        const token = authResponse.body.token;
        storeToken(token);
        setState({ redirect: true } as any);
    } catch (error) {
        console.log(error);
        setState({ invalidLoginInformation: error.response.body.message } as any);
    }
}
