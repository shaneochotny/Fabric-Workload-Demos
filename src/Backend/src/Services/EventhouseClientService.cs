﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Linq;
using Kusto.Data;
using Kusto.Data.Net.Client;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with Eventhouses.
    /// </summary>
    public class EventhouseClientService : IEventhouseClientService
    {
        private readonly ILogger<EventhouseClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        public class LROOperationStatus
        {
            public string Status { get; set; }
            public int PercentComplete { get; set; }
            public LROErrorDetails Error { get; set; }
        }

        public class LROErrorDetails
        {
            public string Code { get; set; }
            public string Message { get; set; }
        }

        public EventhouseClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            ILogger<EventhouseClientService> logger)
        {
            _logger = logger;
            _configuration = configuration.GetConfiguration();
            _httpClientService = httpClientService;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
        }

        /// <summary>
        /// Retrieves a list of Eventhouses available in the specified Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The GUID of the Workspace that contains the Eventhouses.</param>
        /// <returns>A list of Eventhouses</returns>
        public async Task<List<Eventhouse>> ListEventhouses(string token, Guid workspaceId)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/eventhouses";
            var allEventhouses = new List<Eventhouse>();

            try
            {
                while (!string.IsNullOrEmpty(url))
                {
                    // Make API call and get response
                    var response = await _httpClientService.GetAsync(url, token);
                    var content = await response.Content.ReadAsStringAsync();
                    var eventhouses = JsonConvert.DeserializeObject<Eventhouses>(content);

                    if (eventhouses?.Value != null)
                    {
                        allEventhouses.AddRange(eventhouses.Value);
                    }

                    // Check if we have more pages
                    url = !string.IsNullOrEmpty(eventhouses.ContinuationUri) 
                        ? eventhouses.ContinuationUri 
                        : null;
                }

                return allEventhouses;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error fetching eventhouses: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching eventhouses: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Gets the details of a provided Eventhouse in the specified Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">workspaceId of the Eventhouse.</param>
        /// <param name="eventhouseIdOrName">The Name or GUID of the Eventhouse.</param>
        /// <returns>Eventhouse properties</returns>
        public async Task<Eventhouse> GetEventhouse(string token, Guid workspaceId, string eventhouseIdOrName)
        {
            var eventhouses = await ListEventhouses(token, workspaceId);
            return eventhouses.Find(e => e?.Id == eventhouseIdOrName || e?.DisplayName == eventhouseIdOrName);
        }

        /// <summary>
        /// Creates a new Eventhouse in the provided Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace that contains the directory.</param>
        /// <param name="eventhouseName">The name of the Eventhouse to be created.</param>
        /// <param name="eventhouseDescription">The description of the Eventhouse to be created.</param>
        /// <returns>Response from the Eventhouse creation</returns>
        public async Task<Eventhouse> CreateEventhouse(string token, Guid workspaceId, string eventhouseName, string eventhouseDescription)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/eventhouses";

            var eventhouseSettings = new { 
                displayName = eventhouseName, 
                description = eventhouseDescription 
            };
            var postContent = new StringContent(JsonConvert.SerializeObject(eventhouseSettings), Encoding.UTF8, "application/json");

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

                return JsonConvert.DeserializeObject<Eventhouse>(content);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a list of Eventhouse Databases available in the selected Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace that contains the directory.</param>
        /// <returns>A list of Eventhouse Databases</returns>
        public async Task<List<KQLDatabase>> ListKQLDatabases(string token, Guid workspaceId)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/kqlDatabases";
            var allKQLDatabases = new List<KQLDatabase>();

            try
            {
                while (!string.IsNullOrEmpty(url))
                {
                    // Make API call and get response
                    var response = await _httpClientService.GetAsync(url, token);
                    var content = await response.Content.ReadAsStringAsync();
                    var kqlDatabases = JsonConvert.DeserializeObject<KQLDatabases>(content);

                    if (kqlDatabases?.Value != null)
                    {
                        allKQLDatabases.AddRange(kqlDatabases.Value);
                    }

                    // Check if we have more pages
                    url = !string.IsNullOrEmpty(kqlDatabases.ContinuationUri) 
                        ? kqlDatabases.ContinuationUri 
                        : null;
                }

                return allKQLDatabases;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error fetching KQL Databases: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching KQL Databases: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Gets the details of a provided Eventhouse Database in the specified Workspace using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The Workspace GUID that contains the Eventhouse Database.</param>
        /// <param name="kqlDatabaseIdOrName">The Name or GUID of the Eventhouse Database.</param>
        /// <returns>Eventhouse Database properties</returns>
        public async Task<KQLDatabase> GetKQLDatabase(string token, Guid workspaceId, string kqlDatabaseIdOrName)
        {
            var kqlDatabases = await ListKQLDatabases(token, workspaceId);
            return kqlDatabases.Find(k => k?.Id == kqlDatabaseIdOrName || k?.DisplayName == kqlDatabaseIdOrName);
        }

        /// <summary>
        /// Creates an Eventhouse Database in the provided Workspace and Eventhouse using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The Workspace GUID that contains the Eventhouse Database.</param>
        /// <param name="eventhouseId">The parent Eventhouse GUID to create the Database under.</param>
        /// <param name="databaseName">The name of the new Eventhouse Database.</param>
        /// <param name="databaseDescription">The description of the new Eventhouse Database.</param>
        /// <returns>Response from the Eventhouse Database creation</returns>
        public async Task<KQLDatabase> CreateKQLDatabase(string token, Guid workspaceId, Guid eventhouseId, string databaseName, string databaseDescription)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/kqlDatabases";

            var kqlDatabaseSettings = new { 
                displayName = databaseName, 
                description = databaseDescription,
                creationPayload = new {
                    databaseType = "ReadWrite",
                    parentEventhouseItemId = eventhouseId
                }
            };
            var postContent = new StringContent(JsonConvert.SerializeObject(kqlDatabaseSettings), Encoding.UTF8, "application/json");

            try
            {
                // Set the Authorization header using the bearer token using the _httpClientService
                var response = await _httpClientService.PostAsync(url, postContent, token);

                if (!response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    throw new HttpRequestException(content, null, response.StatusCode);
                }

                // This Fabric API is a long running operation so we need to get the URI from the
                // POST header to check on the status
                var operation = await _httpClientService.WaitForOperationCompletion<LROOperationStatus>(token, response);

                if (operation.Status.ToLower() == "succeeded")
                {
                    // After the KQLDatabase has been created we need to retrieve the details since 
                    // they're not returned in the LRO response
                    var kqlDatabases = await ListKQLDatabases(token, workspaceId);
                    var kqlDatabase = kqlDatabases.Find(kqlDatabase => kqlDatabase.DisplayName == databaseName);
                    return kqlDatabase;
                }
                else
                {
                    throw new HttpRequestException(operation.Status);
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Executes a query against an Eventhouse Database using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="query">The query to execute.</param>
        /// <param name="connectionString">Eventhouse Connection String (i.e. https://cluster-name.z6.kusto.fabric.microsoft.com/)</param>
        /// <param name="databaseName">The Eventhouse Database name.</param>
        /// <returns>DataTable of the query results</returns>
        public async Task<DataTable> ExecuteQuery(string token, string query, string connectionString, string databaseName)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(
                    _httpContextAccessor.HttpContext, 
                    allowedScopes: new[] { 
                        WorkloadScopes.FabricLakehouseReadAll, 
                        WorkloadScopes.FabricLakehouseReadWriteAll 
                    });

                // Obtain a token scoped to the Eventhouse cluster
                var dataAccessToken = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, new[] { $"{connectionString}/.default"});

                // Authenticate to Eventhouse on behalf of the user
                var kustoConnectionStringBuilder = new KustoConnectionStringBuilder(connectionString).WithAadUserTokenAuthentication(dataAccessToken);

                var queryResults = new DataTable();
                using var kustoClient = KustoClientFactory.CreateCslQueryProvider(kustoConnectionStringBuilder);
                using var reader = kustoClient.ExecuteQuery(databaseName, query, null);
                
                if (reader != null)
                {
                    queryResults.Load(reader);
                }

                return queryResults;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Executes a control query against an Eventhouse Database using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="query">The query to execute.</param>
        /// <param name="connectionString">Eventhouse Connection String (i.e. https://cluster-name.z6.kusto.fabric.microsoft.com/)</param>
        /// <param name="databaseName">The Eventhouse Database name.</param>
        /// <returns>DataTable of the query results</returns>
        public async Task<DataTable> ExecuteControlQuery(string token, string query, string connectionString, string databaseName)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(
                    _httpContextAccessor.HttpContext, 
                    allowedScopes: new[] { 
                        WorkloadScopes.FabricLakehouseReadAll, 
                        WorkloadScopes.FabricLakehouseReadWriteAll 
                    });

                // Obtain a token scoped to the Eventhouse cluster
                var dataAccessToken = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, new[] { $"{connectionString}/.default"});

                // Authenticate to Eventhouse on behalf of the user
                var kustoConnectionStringBuilder = new KustoConnectionStringBuilder(connectionString).WithAadUserTokenAuthentication(dataAccessToken);

                var queryResults = new DataTable();
                using var kustoClient = KustoClientFactory.CreateCslAdminProvider(kustoConnectionStringBuilder);
                using var reader = kustoClient.ExecuteControlCommand(databaseName, query, null);
                
                if (reader != null)
                {
                    queryResults.Load(reader);
                }

                return queryResults;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                throw;
            }
        }
    }
}