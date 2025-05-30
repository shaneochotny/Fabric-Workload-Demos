﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Linq;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with the Lakehouse storage.
    /// </summary>
    public class WorkloadClientService : IWorkloadClientService
    {
        private readonly ILogger<WorkloadClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;
        private readonly ILakehouseClientService _lakehouseClientService;

        public WorkloadClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            ILakehouseClientService lakehouseClientService,
            ILogger<WorkloadClientService> logger)
        {
            _logger = logger;
            _configuration = configuration.GetConfiguration();
            _httpClientService = httpClientService;
            _lakehouseClientService = lakehouseClientService;
        }

        /// <summary>
        /// Gets the Workload Settings Lakehouse.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">workspaceId of the requested Workspace.</param>
        /// <returns>Lakehouse properties</returns>
        public async Task<Lakehouse> GetWorkloadSettingsLakehouse(string token, Guid workspaceId)
        {
            var lakehouses = await _lakehouseClientService.GetLakehouseList(token, workspaceId);
            var workloadSettingsLakehouse = lakehouses.Value.Find(lakehouse => lakehouse.DisplayName == "WorkloadSettings");
            return workloadSettingsLakehouse;
        }
    }
}