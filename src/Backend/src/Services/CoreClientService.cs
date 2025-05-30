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
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with the Lakehouse storage.
    /// </summary>
    public class CoreClientService : ICoreClientService
    {
        private readonly ILogger<CoreClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;

        public CoreClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            ILogger<CoreClientService> logger)
        {
            _logger = logger;
            _configuration = configuration.GetConfiguration();
            _httpClientService = httpClientService;
        }

        /// <summary>
        /// Retrieves a list of Pipelines available in the selected Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace.</param>
        /// <returns>List of Pipelines</returns>
        public async Task<List<Connection>> ListConnections(string token)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/connections";
            var allConnections = new List<Connection>();

            try
            {
                while (!string.IsNullOrEmpty(url))
                {
                    // Make API call and get response
                    var response = await _httpClientService.GetAsync(url, token);
                    var content = await response.Content.ReadAsStringAsync();
                    var connections = JsonConvert.DeserializeObject<Connections>(content);

                    if (connections?.Value != null)
                    {
                        allConnections.AddRange(connections.Value);
                    }

                    // Check if we have more pages
                    url = !string.IsNullOrEmpty(connections.ContinuationUri) 
                        ? connections.ContinuationUri 
                        : null;
                }

                return allConnections;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error fetching connections: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching connections: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Get a Connection using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="connectionName">The name of the connection to retrieve.</param>
        /// <returns>Connection details</returns>
        public async Task<Connection> GetConnection(string token, string connectionName)
        {
            var connections = await ListConnections(token);
            return connections.Find(c => c?.DisplayName == connectionName);
        }

        /// <summary>
        /// Create a Connection using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="connectionPayload">The payload of the Connection to be created.</param>
        /// <returns>Response from the Connection creation</returns>
        public async Task<Connection> CreateConnection(string token, string connectionPayload)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/connections";
            var postContent = new StringContent(connectionPayload, Encoding.UTF8, "application/json");

            try
            {
                // Set the Authorization header using the bearer token using the _httpClientService
                var response = await _httpClientService.PostAsync(url, postContent, token);

                // Read the response content as a string
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException(content, null, response.StatusCode);
                }

                return JsonConvert.DeserializeObject<Connection>(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating connection: {Message}", ex.Message);
                throw;
            }
        }
    }
}