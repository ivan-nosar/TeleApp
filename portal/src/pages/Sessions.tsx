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
    useTheme,
    CssBaseline,
    Paper,
    Grid
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import * as superagent from "superagent";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { renderDrawer } from "../sharedRenderers/AppDrawer";
import {
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Bar,
    LineChart,
    Line,
    ResponsiveContainer,
    ComposedChart
} from "recharts";
import * as recharts from "recharts";

interface State {
    appName: string;
    appId: number;
    username: string;
    appSecret: string;
    dataLoaded: boolean;
    showAppSecretTooltip: boolean;
    sessions: any[];
    logs: any[];
    metrics: any[];
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
    contentDiv: {
        margin: theme.spacing(3, 6, 0, 0),
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
    paper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
    fixedHeight: {
        height: 350,
    },
    fixedHeightMax: {
        height: 725,
    },
    chartContainer: {
        margin: theme.spacing(2, 0, 0, 0),
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
        sessions: [],
        logs: [],
        metrics: [],
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

                    const logsResponse = await superagent
                        .get(`http://localhost:4939/sessions/${user.id}/${appDataResponse.body.id}/logs`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (logsResponse.status !== 200) {
                        console.error("Unable to retrieve app's data");
                    }

                    const metricsResponse = await superagent
                        .get(`http://localhost:4939/sessions/${user.id}/${appDataResponse.body.id}/metrics`)
                        .set("Authorization", `Bearer ${user.authToken}`)
                        .send();
                    if (metricsResponse.status !== 200) {
                        console.error("Unable to retrieve app's data");
                    }

                    const newState: State = JSON.parse(JSON.stringify(state));
                    newState.appName = appDataResponse.body.name || "";
                    newState.appId = appDataResponse.body.id || 0;
                    newState.sessions = appSessionsResponse.body || [];
                    newState.logs = logsResponse.body || [];
                    newState.metrics = metricsResponse.body || [];
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
                        <Typography className={classes.endBreadcrumb}>Sessions</Typography>
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
    const data = prepareDataForVisualization(state.sessions);
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    const fixedHeightMaxPaper = clsx(classes.paper, classes.fixedHeightMax);

    return (
        <div className={classes.contentDiv}>
            <Toolbar />

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={fixedHeightPaper}>
                        <Typography component="h1" variant="h5">
                        Sessions per day
                        </Typography>
                        <ResponsiveContainer className={classes.chartContainer}>
                            <LineChart
                                data={data.sessionsPerDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" />
                                <YAxis/>
                                <recharts.Tooltip />
                                <Line dataKey="count" stroke="#6465a5" type="monotone" strokeWidth={3}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper className={fixedHeightPaper}>
                                <Typography component="h1" variant="h5">
                                OS versions utilization
                                </Typography>
                                <ResponsiveContainer className={classes.chartContainer}>
                                    <BarChart data={data.osUtilization}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis dataKey="count"/>
                                        <recharts.Tooltip />
                                        <Bar dataKey="count" fill="#0584f2" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={fixedHeightPaper}>
                                <Typography component="h1" variant="h5">
                                Locales utilization
                                </Typography>
                                <ResponsiveContainer className={classes.chartContainer}>
                                    <BarChart data={data.localeUtilization}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis dataKey="count"/>
                                        <recharts.Tooltip />
                                        <Bar dataKey="count" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={fixedHeightMaxPaper}>
                        <Typography component="h1" variant="h5">
                        Device models utilization
                        </Typography>
                        <ResponsiveContainer className={classes.chartContainer}>
                            <ComposedChart
                                data={data.devicesUtilization}
                                layout="vertical"
                                margin={{
                                    left: 40,
                                }}>
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="count" type="number" />
                                <YAxis dataKey="name" type="category"/>
                                <recharts.Tooltip />
                                <Bar barSize={20} dataKey="count" fill="#f28a30" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

interface Session {
    id: number;
    timestamp: string;
    deviceModelName: string;
    osVersionName: string;
    localeName: string;
}

interface VisualizationData {
    sessionsPerDay: any[];
    devicesUtilization: any[];
    osUtilization: any[];
    localeUtilization: any[];
}

function prepareDataForVisualization(sessions: Session[]): VisualizationData {
    const days = 30;

    const result: VisualizationData = {
        sessionsPerDay: [],
        devicesUtilization: [],
        osUtilization: [],
        localeUtilization: []
    };

    // Sessions per day
    const dateLocaleOptions = {
        month: "short",
        day: "numeric"
    };
    const sessionsWithDayTimeStamp = sessions.map((session: Session) => {
        session.timestamp = (new Date(session.timestamp)).toLocaleString("en-EN", dateLocaleOptions);
        return session;
    });
    const sessionsPerDay: any[] = [];
    const currentDate = new Date();
    for (let i = 0; i < days; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        const timestamp = currentDate.toLocaleString("en-EN", dateLocaleOptions);
        const count = sessionsWithDayTimeStamp.filter(session => session.timestamp === timestamp).length;
        sessionsPerDay.push({
            timestamp,
            count
        });
    }
    result.sessionsPerDay = sessionsPerDay.reverse();

    // Devices utilizaion (top 20)
    const deviceReducer = sessions.reduce((reducer: any, session: Session) => {
        if (session.deviceModelName in reducer) {
            reducer[session.deviceModelName]++;
        } else {
            reducer[session.deviceModelName] = 1;
        }
        return reducer;
    }, {});
    let devicesUtilization = [];
    for (const key in deviceReducer) {
        devicesUtilization.push({
            name: key,
            count: deviceReducer[key]
        });
    }
    devicesUtilization = devicesUtilization.sort((a, b) => b.count - a.count);
    const topDevices = devicesUtilization.slice(0, 19);
    const otherDevices = devicesUtilization.slice(19).reduce((sum: number, current: any) => {
        sum += current.count;
        return sum;
    }, 0);
    result.devicesUtilization = otherDevices ?
        [...topDevices, { name: "Others", count: otherDevices }] :
        devicesUtilization.slice(0, 20);

    // OS version utilization (top 10) - Bar chart
    const osReducer = sessions.reduce((reducer: any, session: Session) => {
        if (session.osVersionName in reducer) {
            reducer[session.osVersionName]++;
        } else {
            reducer[session.osVersionName] = 1;
        }
        return reducer;
    }, {});
    let osUtilization = [];
    for (const key in osReducer) {
        osUtilization.push({
            name: key,
            count: osReducer[key]
        });
    }
    osUtilization = osUtilization.sort((a, b) => b.count - a.count);
    const topOs = osUtilization.slice(0, 9);
    const otherOs = osUtilization.slice(9).reduce((sum: number, current: any) => {
        sum += current.count;
        return sum;
    }, 0);
    result.osUtilization = otherOs ?
        [...topOs, { name: "Others", count: otherOs }] :
        osUtilization.slice(0, 10);

    // Locale utilization (top 10) - Bar chart
    const localeReducer = sessions.reduce((reducer: any, session: Session) => {
        if (session.localeName in reducer) {
            reducer[session.localeName]++;
        } else {
            reducer[session.localeName] = 1;
        }
        return reducer;
    }, {});
    let localeUtilization = [];
    for (const key in localeReducer) {
        localeUtilization.push({
            name: key,
            count: localeReducer[key]
        });
    }
    localeUtilization = localeUtilization.sort((a, b) => b.count - a.count);
    const topLocale = localeUtilization.slice(0, 9);
    const otherLocale = localeUtilization.slice(9).reduce((sum: number, current: any) => {
        sum += current.count;
        return sum;
    }, 0);
    result.localeUtilization = otherLocale ?
        [...topLocale, { name: "Others", count: otherLocale }] :
        localeUtilization.slice(0, 10);

    return result;
}
