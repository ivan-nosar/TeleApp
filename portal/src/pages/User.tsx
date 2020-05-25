import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { checkSigning, extractSignedUser } from "../helpers/signing";
import * as superagent from "superagent";
import { Notes, Equalizer } from "@material-ui/icons";

interface State {
    username: string;
    apps: any[];
    dataLoaded: boolean;
}

export function User(props: any) {
    const [state, setState] = React.useState<State>({
        username: "",
        apps: [],
        dataLoaded: false
    });

    const user = extractSignedUser();
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

                    const newState: State = {
                        username: userDataResponse.body.username || "",
                        apps: appsResponse.body || [],
                        dataLoaded: true
                    };

                    if (!isCancelled) {
                        setState(newState);
                    }
                } catch (error) {
                    console.log(error);
                    setState({ invalidLoginInformation: error.message } as any);
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

    if (!checkSigning()) {
        return <Redirect to="/sign-in" />;
    }

    if (!user.id) {
        return <Redirect to="/sign-in" />;
    } else if (userId !== user.id) {
        return <Redirect to={`/user/${user.id}`} />;
    }

    return (
        <div>
            <p>User {user.id}</p>
            <p>{(state.apps && state.apps.length) || 0}</p>
            <p>Logs: <Notes></Notes></p>
            <p>Metrics: <Equalizer></Equalizer></p>
        </div>
    );
}
