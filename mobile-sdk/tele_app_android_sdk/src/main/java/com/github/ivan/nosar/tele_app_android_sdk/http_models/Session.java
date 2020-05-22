package com.github.ivan.nosar.tele_app_android_sdk.http_models;

import com.google.gson.annotations.Expose;

public class Session {
    @Expose(serialize = false)
    public final long id;
    @Expose(serialize = false)
    public final String timestamp;
    @Expose
    public final String deviceModelName;
    @Expose
    public final String osVersionName;
    @Expose
    public final String localeName;

    public Session(
            int id,
            String timestamp,
            String deviceModelName,
            String osVersionName,
            String localeName
    ) {
        this.id = id;
        this.timestamp = timestamp;
        this.deviceModelName = deviceModelName;
        this.osVersionName = osVersionName;
        this.localeName = localeName;
    }
}
