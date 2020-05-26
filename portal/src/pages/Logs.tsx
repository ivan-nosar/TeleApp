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
    Paper,
    Grid,
    TextField,
    ThemeProvider
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
import { Search } from "@material-ui/icons";

interface State {
    appName: string;
    appId: number;
    username: string;
    appSecret: string;
    dataLoaded: boolean;
    showAppSecretTooltip: boolean;
    logs: any[];
    drawerOpened: boolean;
    filter: string;
    filteredLogs: any[];
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
    contentDiv: {
        margin: theme.spacing(3, 6, 0, 0),
        width: "100%"
    },
    input: {
        padding: theme.spacing(2, 4, 0, 4),
    }
}));

export function Logs(props: any) {
    const [state, setState] = React.useState<State>({
        appName: "",
        appId: 0,
        username: "",
        appSecret: "",
        dataLoaded: false,
        showAppSecretTooltip: false,
        filter: "",
        logs: [],
        filteredLogs: [],
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

                    const logsResponse = await superagent
                        .get(`http://localhost:4939/sessions/${user.id}/${appDataResponse.body.id}/logs`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (logsResponse.status !== 200) {
                        console.error("Unable to retrieve app's data");
                    }

                    const newState: State = JSON.parse(JSON.stringify(state));
                    newState.appName = appDataResponse.body.name || "";
                    newState.appId = appDataResponse.body.id || 0;
                    newState.logs = logsResponse.body || [];
                    newState.filteredLogs = logsResponse.body || [];
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

            { renderContent(state, setState, user, classes, theme) }
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
                        <Typography className={classes.endBreadcrumb}>Logs</Typography>
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

function renderContent(
    state: State,
    setState: (state: State) => void,
    user: SignedUserInfo,
    classes: any,
    theme: any
) {
    const dateLocaleOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    };
    const listItems = state.filteredLogs.map(log => {
        const localizedTimestamp = (new Date(log.timestamp)).toLocaleString("en-EN", dateLocaleOptions);
        return (
            <div key={log.id}>
                <ListItem>
                    <ListItemText secondary={localizedTimestamp} primary={log.text} />
                </ListItem>
                <Divider />
            </div>
        );
    });

    const filterLogs = (filter: string) => {
        const newState: State = JSON.parse(JSON.stringify(state));
        newState.filteredLogs = newState.logs.filter((log: any) => {
            const localizedTimestamp = (new Date(log.timestamp)).toLocaleString("en-EN", dateLocaleOptions);
            return (log.text.includes(filter)) || (localizedTimestamp.includes(filter));
        });
        newState.filter = filter;
        setState(newState as any);
    };

    return (
        <div className={classes.contentDiv}>
            <Toolbar />
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper>
                        <TextField
                            fullWidth
                            type="search"
                            className={classes.input}
                            placeholder="Filter logs"
                            inputProps={{ "aria-label": "filter logs" }}
                            value={state.filter}
                            onChange={(event: any) => {
                                const newFilter = event.target.value;
                                filterLogs(newFilter);
                            }}
                        />
                        <br />
                        <ListItemText className={classes.input} primary={`Count: ${state.filteredLogs.length}`} />
                        <Divider />

                        <List component="nav" aria-label="main mailbox folders">
                            { listItems }
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
