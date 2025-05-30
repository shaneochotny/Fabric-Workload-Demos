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
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with the Lakehouse storage.
    /// </summary>
    public class DataPipelineClientService : IDataPipelineClientService
    {
        private readonly ILogger<DataPipelineClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;

        public DataPipelineClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            ILogger<DataPipelineClientService> logger)
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
        public async Task<List<DataPipeline>> ListDataPipelines(string token, Guid workspaceId)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/dataPipelines";
            var allPipelines = new List<DataPipeline>();

            try
            {
                while (!string.IsNullOrEmpty(url))
                {
                    // Make API call and get response
                    var response = await _httpClientService.GetAsync(url, token);
                    var content = await response.Content.ReadAsStringAsync();
                    var pipelines = JsonConvert.DeserializeObject<DataPipelines>(content);

                    if (pipelines?.Value != null)
                    {
                        allPipelines.AddRange(pipelines.Value);
                    }

                    // Check if we have more pages
                    url = !string.IsNullOrEmpty(pipelines.ContinuationUri) 
                        ? pipelines.ContinuationUri 
                        : null;
                }

                return allPipelines;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error fetching pipelines: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching pipelines: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Gets a Data Pipeline.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">workspaceId of the Pipeline.</param>
        /// <param name="dataPipelineName">Name of the Pipeline.</param>
        /// <returns>Pipeline properties</returns>
        public async Task<DataPipeline> GetDataPipeline(string token, Guid workspaceId, string dataPipelineName)
        {
            var dataPipelines = await ListDataPipelines(token, workspaceId);
            return dataPipelines.Find(c => c?.DisplayName == dataPipelineName);
        }

        /// <summary>
        /// Create a Pipeline in the provided Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace.</param>
        /// <param name="dataPipelineName">The name of the Pipeline to be created.</param>
        /// <param name="dataPipelinePayload">The payload of the Pipeline to be created.</param>
        /// <returns>Response from the Pipeline creation</returns>
        public async Task<ItemCreateResponse> CreateDataPipeline(string token, Guid workspaceId, string dataPipelineName, string dataPipelinePayload)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/items";
            string base64Payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(dataPipelinePayload));

            // Metadata and base64 encoded payload for the DataPipeline
            var dataPipelineSettings = new { 
                displayName = dataPipelineName,
                type = "DataPipeline",
                definition = new { 
                    parts = new[] { 
                        new { 
                            path = "pipeline-content.json", 
                            payload = base64Payload, 
                            payloadType = "InlineBase64" 
                        } 
                    }
                }
            };

            var postContent = new StringContent(JsonConvert.SerializeObject(dataPipelineSettings), Encoding.UTF8, "application/json");

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

                var lakehouse = JsonConvert.DeserializeObject<ItemCreateResponse>(content);

                return lakehouse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating pipeline: {Message}", ex.Message);
                throw;
            }
        }
    }
}