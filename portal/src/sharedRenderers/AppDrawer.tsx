import { SignedUserInfo } from "../helpers/signing";
import React from "react";
import { Drawer, IconButton, Divider, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import clsx from "clsx";
import NotesIcon from "@material-ui/icons/Notes";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import TimelineIcon from "@material-ui/icons/Timeline";
import CodeIcon from "@material-ui/icons/Code";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

export function renderDrawer(
    state: any,
    setState: (state: any) => void,
    user: SignedUserInfo,
    classes: any,
    theme: any
) {
    const tabsToMeta = {
        "Getting started": {
            icon: <CodeIcon />,
            link: `/user/${user.id}/apps/${state.appId}`
        },
        "Sessions": {
            icon: <TimelineIcon />,
            link: `/user/${user.id}/apps/${state.appId}/sessions`
        },
        "Logs": {
            icon: <NotesIcon />,
            link: `/user/${user.id}/apps/${state.appId}/logs`
        },
        "Metrics": {
            icon: <EqualizerIcon />,
            link: `/user/${user.id}/apps/${state.appId}/metrics`
        }
    };
    const handleDrawerClose = () => {
        const newState = JSON.parse(JSON.stringify(state));
        newState.drawerOpened = false;
        setState(newState);
    };

    return (
        <React.Fragment>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: state.drawerOpened,
                    [classes.drawerClose]: !state.drawerOpened,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: state.drawerOpened,
                        [classes.drawerClose]: !state.drawerOpened,
                    }),
                }}>
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    {["Getting started", "Sessions", "Logs", "Metrics"].map((text, index) => (
                        <ListItem button key={text} component="a" href={(tabsToMeta as any)[text].link}>
                            <ListItemIcon>{(tabsToMeta as any)[text].icon}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </React.Fragment>
    );
}
