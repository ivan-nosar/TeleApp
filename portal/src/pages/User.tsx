import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { checkSigning, extractSignedUser, SignedUserInfo } from "../helpers/signing";
import * as superagent from "superagent";
import { Search } from "@material-ui/icons";
import {
    Container,
    Typography,
    makeStyles,
    Button,
    AppBar,
    Toolbar,
    Paper,
    List,
    ListItemText,
    ListItem,
    Divider,
    TextField,
    IconButton,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Breadcrumbs
} from "@material-ui/core";

interface State {
    username: string;
    apps: any[];
    dataLoaded: boolean;
    newAppDialogOpen: boolean;
    errorInNewAppName?: string;
    newAppName: string;
    newAppId: number;
}

const useStyles = makeStyles(theme => ({
    maintext: {
        textAlign: "center",
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily
    },
    subtext: {
        textAlign: "center",
        color: theme.palette.text.secondary,
        fontFamily: theme.typography.fontFamily
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
    search: {
        padding: theme.spacing(1)
    },
    link: {
        display: "flex",
        color: "white"
    },
    endBreadcrumb: {
        display: "flex",
        color: theme.palette.text.primary
    },
    divider: {
        margin: theme.spacing(4)
    }
}));

export function User(props: any) {
    const [state, setState] = React.useState<State>({
        username: "",
        apps: [],
        dataLoaded: false,
        newAppDialogOpen: false,
        errorInNewAppName: undefined,
        newAppName: "",
        newAppId: -1
    });
    const classes = useStyles();

    const user: SignedUserInfo = extractSignedUser();
    const userId = props.match.params.id;

    useEffect(() => {
        document.title = `TeleApp | Hello ${state.username}!`;

        if (user.id === userId) {
            let isCancelled = false;
            const fetachUserData = async () => {
                try {
                    const userDataResponse = await superagent
                        .get(`http://localhost:4939/users/${userId}`)
                        .send();
                    if (userDataResponse.status !== 200) {
                        console.error("Unable to retrieve user's data");
                    }

                    const appsResponse = await superagent
                        .get(`http://localhost:4939/users/${userId}/apps`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (appsResponse.status !== 200) {
                        console.error("Unable to retrieve user's apps");
                    }

                    const loadedApps = appsResponse.body || [];
                    const newState: State = JSON.parse(JSON.stringify(state));
                    newState.username = userDataResponse.body.username || "";
                    newState.apps = loadedApps;
                    newState.dataLoaded = true;

                    if (!isCancelled) {
                        setState(newState as any);
                    }
                } catch (error) {
                    console.log(error);
                }
            };

            if (!state.dataLoaded) {
                fetachUserData();
            }

            // To prevent bootstrping of data if component was unmounted with
            return () => {
                isCancelled = true;
            };
        }
    });

    if (state.newAppId > 0) {
        return <Redirect to={`./${userId}/apps/${state.newAppId}`} />;
    }

    if (!checkSigning()) {
        return <Redirect to="/sign-in" />;
    }

    if (!user.id) {
        return <Redirect to="/sign-in" />;
    } else if (userId !== user.id) {
        return <Redirect to={`/user/${user.id}`} />;
    }

    const shouldRenderList = !!(state.apps && state.apps.length);

    return (
        <React.Fragment>
            <AppBar>
                <Toolbar>
                    <Typography component="h1" variant="h5">
                        TeleApp
                    </Typography>

                    <Divider orientation="vertical" flexItem className={classes.divider} />

                    <Breadcrumbs className={classes.title}>
                        <Typography className={classes.endBreadcrumb}>{`${state.username}'s apps`}</Typography>
                    </Breadcrumbs>

                    { shouldRenderList &&
                        <Button className={classes.blue}
                            onClick={() => openNewAppDialog(state, setState)}>
                                Create new app
                        </Button >
                    }
                </Toolbar>
            </AppBar>
            <Toolbar />
            { shouldRenderList && renderAppsList(state, setState, user, classes) }
            { !shouldRenderList && renderEmpty(state, setState, user, classes)}
            { renderNewAppDialog(state, setState, user, classes) }
        </React.Fragment>
    );
}

function renderEmpty(state: State, setState: (state: State) => void, user: SignedUserInfo, classes: any) {
    return (
        <Container component="main" maxWidth="xs">
            <h2 className={classes.maintext}>
                Welcome :)
            </h2>
            <p className={classes.subtext}>
                Add your first app to begin exploring TeleApp
            </p>
            <p className={classes.subtext}>
                <Button variant="contained" color="primary"
                    onClick={() => openNewAppDialog(state, setState)}>
                    Add app
                </Button>
            </p>
        </Container>
    );
}

function renderAppsList(state: State, setState: (state: State) => void, user: SignedUserInfo, classes: any) {
    const listItems = state.apps.map(app => {
        return (
            <div key={app.id}>
                <ListItem button component="a" href={`./${user.id}/apps/${app.id}`}>
                    <ListItemText primary={app.name} />
                </ListItem>
                <Divider />
            </div>
        );
    });

    return (
        <Container>
            <Paper>
                <Grid container justify="flex-end" className={classes.search}>
                    <Grid item>
                        <TextField
                            type="search"
                            className={classes.input}
                            placeholder="Filter apps"
                            inputProps={{ "aria-label": "filter apps" }}
                        />
                        <IconButton type="submit" className={classes.iconButton} aria-label="search">
                            <Search />
                        </IconButton>
                    </Grid>
                </Grid>

                <List component="nav" aria-label="main mailbox folders">
                    { listItems }
                </List>
            </Paper>
        </Container>
    );
}

function openNewAppDialog(state: State, setState: (state: State) => void) {
    const newState: State = JSON.parse(JSON.stringify(state));
    newState.newAppDialogOpen = true;
    setState(newState);
}

function renderNewAppDialog(state: State, setState: (state: State) => void, user: SignedUserInfo, classes: any) {
    const handleClose = () => {
        const newState: State = JSON.parse(JSON.stringify(state));
        newState.newAppDialogOpen = false;
        newState.errorInNewAppName = "";
        newState.newAppName = "";
        setState(newState);
    };

    const handleCreate = async () => {
        const errors: any = {
            errorInNewAppName: undefined
        };
        if (state.newAppName === "") {
            errors.errorInNewAppName = "Invalid app name provided";
        }

        if (errors.errorInNewAppName) {
            const newState: State = JSON.parse(JSON.stringify(state));
            newState.errorInNewAppName = errors.errorInNewAppName;
            setState(newState);
        } else {
            createNewApp(state, setState, user);
            console.log("Fine");
        }
    };

    return (
        <Dialog
            open={state.newAppDialogOpen}
            onClose={handleClose}
            aria-labelledby="create-new-app"
            aria-describedby="body"
            fullWidth={true}
            maxWidth="sm">
            <DialogTitle id="create-new-app">{"Create new app"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="body">
                <TextField
                    id="standard-full-width"
                    label="App name"
                    style={{ margin: 8 }}
                    placeholder="Enter an app name:"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={state.newAppName}
                    onChange={(event: any) => {
                        const newState: State = JSON.parse(JSON.stringify(state));
                        newState.newAppName = event.target.value;
                        setState(newState);
                    }}
                    error={!!state.errorInNewAppName}
                    helperText={state.errorInNewAppName}
                />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button onClick={handleCreate} variant="contained" color="primary" autoFocus>
                Create
            </Button>
            </DialogActions>
        </Dialog>
    );
}

async function createNewApp(state: State, setState: (state: State) => void, user: SignedUserInfo) {
    const body = {
        name: state.newAppName
    };
    try {
        const response = await superagent
            .post(`http://localhost:4939/users/${user.id}/apps`)
            .set("Authorization", user.authToken || "")
            .send(body);
        if (response.status === 200) {
            const newAppId = response.body.id;
            setState({ newAppId } as any);
        } else {
            console.error(response);
        }
    } catch (error) {
        console.error(error);
    }
}
