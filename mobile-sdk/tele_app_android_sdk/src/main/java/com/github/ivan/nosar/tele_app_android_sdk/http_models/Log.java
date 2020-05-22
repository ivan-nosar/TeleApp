package com.github.ivan.nosar.tele_app_android_sdk.http_models;

import com.google.gson.annotations.Expose;

public class Log {
    @Expose(serialize = false)
    public final long id;
    @Expose(serialize = false)
    public final String timestamp;
    @Expose
    public final String text;

    public Log(
            int id,
            String timestamp,
            String text
    ) {
        this.id = id;
        this.timestamp = timestamp;
        this.text = text;
    }
}
