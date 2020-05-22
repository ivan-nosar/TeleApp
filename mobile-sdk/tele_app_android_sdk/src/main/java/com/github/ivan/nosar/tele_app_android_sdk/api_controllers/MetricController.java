package com.github.ivan.nosar.tele_app_android_sdk.api_controllers;

import com.github.ivan.nosar.tele_app_android_sdk.http_models.Metric;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface MetricController {
    @POST("/sessions/{sessionId}/metrics")
    Call<Metric> create(@Header("app-secret") String appSecret, @Path("sessionId") long sessionId, @Body Metric metric);
}
