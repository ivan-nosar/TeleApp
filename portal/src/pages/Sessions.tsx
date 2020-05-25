import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { checkSigning, SignedUserInfo, extractSignedUser } from "../helpers/signing";
import { makeStyles, colors, Divider, Breadcrumbs, Link, Tooltip } from "@material-ui/core";
import * as superagent from "superagent";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

interface State {
    appName: string;
    appId: number;
    username: string;
    appSecret: string;
    dataLoaded: boolean;
    showAppSecretTooltip: boolean;
    sessions: any[];
}

const useStyles = makeStyles((theme: any) => ({
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

export function Sessions(props: any) {
    const [state, setState] = React.useState<State>({
        appName: "",
        appId: 0,
        username: "",
        appSecret: "",
        dataLoaded: false,
        showAppSecretTooltip: false,
        sessions: []
    });
    const classes = useStyles();

    const user: SignedUserInfo = extractSignedUser();
    const userId = props.match.params.id;
    const appId = props.match.params.appId;

    useEffect(() => {
        document.title = `TeleApp | ${state.appName}`;

        if (user.id === userId) {
            let isCancelled = false;
            const fetachAppData = async () => {
                try {
                    const appDataResponse = await superagent
                        .get(`http://localhost:4939/users/${userId}/apps/${appId}`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (appDataResponse.status !== 200) {
                        console.error("Unable to retrieve app's data");
                    }

                    const appSecretResponse = await superagent
                        .get(`http://localhost:4939/users/${userId}/apps/${appId}/secret`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (appSecretResponse.status !== 200) {
                        console.error("Unable to retrieve user's apps");
                    }

                    const userDataResponse = await superagent
                        .get(`http://localhost:4939/users/${userId}`)
                        .send();
                    if (userDataResponse.status !== 200) {
                        console.error("Unable to retrieve user's data");
                    }

                    const newState: State = JSON.parse(JSON.stringify(state));
                    newState.appName = appDataResponse.body.name || "";
                    newState.appId = appDataResponse.body.id || 0;
                    newState.username = userDataResponse.body.username || "";
                    newState.appSecret = appSecretResponse.body.secret || "";
                    newState.dataLoaded = true;

                    if (!isCancelled) {
                        setState(newState as any);
                    }
                } catch (error) {
                    console.log(error);
                }
            };

            if (!state.dataLoaded) {
                fetachAppData();
            }

            if (state.appId !== 0) {
                const timer = setTimeout(async () => {
                    await loadSessions(state, setState, user);
                    clearTimeout(timer);
                }, 2000);
            }

            // To prevent bootstrping of data if component was unmounted with
            return () => {
                isCancelled = true;
            };
        }
    });

    if (!checkSigning()) {
        return <Redirect to="/sign-in" />;
    }

    if (!user.id) {
        return <Redirect to="/sign-in" />;
    } else if (userId !== user.id) {
        return <Redirect to={`/user/${user.id}`} />;
    }

    return (
        <React.Fragment>
            <AppBar>
                <Toolbar>
                    <Typography component="h1" variant="h5">
                        TeleApp
                    </Typography>

                    <Divider orientation="vertical" flexItem className={classes.divider} />

                    <Breadcrumbs className={classes.title}>
                        <Link className={classes.link} href={`/user/${userId}`}>{`${state.username}'s apps`}</Link>
                        <Typography className={classes.endBreadcrumb}>{state.appName}</Typography>
                    </Breadcrumbs>

                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                        }}
                        onClose={() => handleTooltipState(state, setState, false)}
                        open={state.showAppSecretTooltip}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title="App secret copied to clipboard">
                        <Button className={classes.blue}
                            onClick={() => copyAppSecretToClipBoard(state, setState)}>
                                Copy app secret
                        </Button >
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Toolbar />
        </React.Fragment>
    );
}

function copyAppSecretToClipBoard(state: State, setState: (state: State) => void) {
    navigator.clipboard.writeText(state.appSecret);
    handleTooltipState(state, setState, true);

    setTimeout(() => { handleTooltipState(state, setState, false); }, 2000);
}

function handleTooltipState(state: State, setState: (state: State) => void, tooltipEnabled: boolean) {
    const newState: State = JSON.parse(JSON.stringify(state));
    newState.showAppSecretTooltip = tooltipEnabled;
    setState(newState);
}

async function loadSessions(state: State, setState: (state: State) => void, user: SignedUserInfo) {
    try {
        const appSessionsResponse = await superagent
            .get(`http://localhost:4939/sessions/${user.id}/${state.appId}`)
            .set("Authorization", `Bearer ${user.authToken}`)
            .send();
        if (appSessionsResponse.status !== 200) {
            console.error("Unable to retrieve app's data");
        }

        const newState: State = JSON.parse(JSON.stringify(state));
        newState.sessions = appSessionsResponse.body || [];
        setState(newState);

        console.log(newState);
    } catch (error) {
        console.log(error);
    }
}
