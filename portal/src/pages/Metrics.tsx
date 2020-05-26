import React, { useEffect } from "react";
import clsx from "clsx";
import { Redirect } from "react-router-dom";
import { checkSigning, SignedUserInfo, extractSignedUser } from "../helpers/signing";
import {
    makeStyles,
    Divider,
    Breadcrumbs,
    Link,
    Tooltip,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    CssBaseline,
    Paper
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import * as superagent from "superagent";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import NotesIcon from "@material-ui/icons/Notes";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import TimelineIcon from "@material-ui/icons/Timeline";
import CodeIcon from "@material-ui/icons/Code";
import Container from "@material-ui/core/Container";
import { renderDrawer } from "../sharedRenderers/AppDrawer";

interface State {
    appName: string;
    appId: number;
    username: string;
    appSecret: string;
    dataLoaded: boolean;
    showAppSecretTooltip: boolean;
    sessions: any[];
    drawerOpened: boolean;
}

const drawerWidth = 240;

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
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: "none",
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: "hidden",
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up("sm")]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    root: {
        display: "flex",
    },
    contentPaper: {
        margin: theme.spacing(3, 4, 0, 0),
    },
    codeBlock: {
        backgroundColor: "#F2F2F2",
        padding: theme.spacing(2),
        fontSize: "14px",
        fontFamily: "Consolas"
    },
    codeBlockInline: {
        backgroundColor: "#F2F2F2",
        fontSize: "14px",
        fontFamily: "Consolas"
    },
}));

export function Metrics(props: any) {
    const [state, setState] = React.useState<State>({
        appName: "",
        appId: 0,
        username: "",
        appSecret: "",
        dataLoaded: false,
        showAppSecretTooltip: false,
        sessions: [],
        drawerOpened: true
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

                    const appSessionsResponse = await superagent
                        .get(`http://localhost:4939/sessions/${user.id}/${appDataResponse.body.id}`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (appSessionsResponse.status !== 200) {
                        console.error("Unable to retrieve app's data");
                    }

                    const newState: State = JSON.parse(JSON.stringify(state));
                    newState.appName = appDataResponse.body.name || "";
                    newState.appId = appDataResponse.body.id || 0;
                    newState.sessions = appSessionsResponse.body || [];
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

            // To prevent bootstrping of data if component was unmounted with
            return () => {
                isCancelled = true;
            };
        }
    });

    const theme = useTheme();

    if (!checkSigning()) {
        return <Redirect to="/sign-in" />;
    }

    if (!user.id) {
        return <Redirect to="/sign-in" />;
    } else if (userId !== user.id) {
        return <Redirect to={`/user/${user.id}`} />;
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            { renderToolbar(state, setState, user, classes) }

            { renderDrawer(state, setState, user, classes, theme) }

            { renderContent(state, setState, user, classes) }
        </div>
    );
}

function copyAppSecretToClipBoard(state: State, setState: (state: State) => void) {
    navigator.clipboard.writeText(state.appSecret);
    handleTooltipState(state, setState, true);

    const tooltipTimer = setTimeout(() => {
        handleTooltipState(state, setState, false);
        clearTimeout(tooltipTimer);
    }, 2000);
}

function handleTooltipState(state: State, setState: (state: State) => void, tooltipEnabled: boolean) {
    const newState: State = JSON.parse(JSON.stringify(state));
    newState.showAppSecretTooltip = tooltipEnabled;
    setState(newState);
}

function renderToolbar(state: State, setState: (state: State) => void, user: SignedUserInfo, classes: any) {
    const handleDrawerOpen = () => {
        const newState: State = JSON.parse(JSON.stringify(state));
        newState.drawerOpened = true;
        setState(newState);
    };

    return (
        <React.Fragment>
            <AppBar
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: state.drawerOpened,
                })}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                            onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: state.drawerOpened,
                        })}>
                        <MenuIcon />
                    </IconButton>
                    <Typography component="h1" variant="h5">
                        TeleApp
                    </Typography>

                    <Divider orientation="vertical" flexItem className={classes.divider} />

                    <Breadcrumbs className={classes.title}>
                        <Link className={classes.link} href={`/user/${user.id}`}>{`${state.username}'s apps`}</Link>
                        <Link
                            className={classes.link}
                            href={`/user/${user.id}/apps/${state.appId}`}>
                            {state.appName}
                        </Link>
                        <Typography className={classes.endBreadcrumb}>Metrics</Typography>
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

function renderContent(state: State, setState: (state: State) => void, user: SignedUserInfo, classes: any) {
    return (
        <Container>
            <Toolbar />
            <Paper elevation={3} className={classes.contentPaper}>
                <main className={classes.content}>
                    <ol className={classes.listItemCounter}>
                        <li>
                            <Typography paragraph>
                                Add the SDK to the project
                            </Typography>

                            <Typography paragraph>
                                In your&nbsp;
                                <span className={classes.codeBlockInline}>app/build.gradle</span>
                                &nbsp;add the following lines:
                            </Typography>

                            <p className={classes.codeBlock}>
                                { "dependencies {" }
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;{ `implementation "com.github.ivan-nosar:tele-app-android-sdk:0.1` }
                                <br />
                                { "}" }
                            </p>
                        </li>

                        <li>
                            <Typography paragraph>
                                Start the SDK
                            </Typography>

                            <Typography paragraph>
                                Open your app’s main activity class and add the following import statements.
                            </Typography>

                            <p className={classes.codeBlock}>
                                { "import com.github.ivan.nosar.tele_app_android_sdk.TeleApp;" }
                            </p>

                            <Typography paragraph>
                                Look for
                                &nbsp;<span className={classes.codeBlockInline}>onCreate</span>
                                &nbsp;callback in the same file and add the following.
                            </Typography>

                            <p className={classes.codeBlock}>
                                { "if (!TeleApp.isConfigured()) {" }
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;{ `TeleApp.start(getApplication(), "${state.appSecret}");` }
                                <br />
                                { "}" }
                            </p>
                        </li>
                    </ol>
                </main>
            </Paper>
        </Container>
    );
}
