import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { checkSigning } from "../helpers/signing";

export function Home() {
    useEffect(() => {
        document.title = "TeleApp | Collect your app usage data gracefully";
    });

    if (checkSigning()) {
        return <Redirect to="/user" />;
    }

    return (
        <div>
            <p>Home</p>
        </div>
    );
}
