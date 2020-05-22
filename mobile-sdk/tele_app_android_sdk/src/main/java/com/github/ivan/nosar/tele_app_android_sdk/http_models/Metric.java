package com.github.ivan.nosar.tele_app_android_sdk.http_models;

import com.google.gson.annotations.Expose;

import java.util.Map;

public class Metric {
    @Expose(serialize = false)
    public final long id;
    @Expose(serialize = false)
    public final String timestamp;
    @Expose
    public final Map<String, Object> content;

    public Metric(
            int id,
            String timestamp,
            Map<String, Object> content
    ) {
        this.id = id;
        this.timestamp = timestamp;
        this.content = content;
    }
}
