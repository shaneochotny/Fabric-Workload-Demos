// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using Boilerplate.Utils;
using Fabric_Extension_BE_Boilerplate.Constants;

namespace Boilerplate.Controllers
{
    [ApiController]
    public class InvestmentInsightsController : ControllerBase
    {
        private static readonly IList<string> OneLakeScopes = [$"{EnvironmentConstants.OneLakeResourceId}/.default"];
        private static readonly IList<string> FabricAPIScopes = [$"{EnvironmentConstants.FabricApiBaseUrl}/.default"];
        private static readonly IList<string> ScopesForWriteLakehouseFile = [WorkloadScopes.FabricLakehouseReadWriteAll];
        private static readonly IList<string> ScopesForWriteWorkspace = [WorkloadScopes.FabricWorkspaceReadWriteAll, WorkloadScopes.FabricLakehouseReadWriteAll, WorkloadScopes.LakehouseReadWriteAll, WorkloadScopes.KQLDatabaseReadWriteAll];
        private static readonly IList<string> ScopesForWriteEventhouse = [WorkloadScopes.FabricWorkspaceReadWriteAll, WorkloadScopes.FabricLakehouseReadWriteAll, WorkloadScopes.EventhouseReadWriteAll, WorkloadScopes.KQLDatabaseReadWriteAll];

        private readonly ILogger<InvestmentInsightsController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly IWorkloadClientService _workloadClientService;
        private readonly ILakehouseClientService _lakehouseClientService;
        private readonly IEventhouseClientService _eventhouseClientService;
        private readonly IDataPipelineClientService _dataPipelineClientService;
        private readonly ICoreClientService _coreClientService;
        private readonly IInvestmentInsightsClientService _investmentInsightsClientService;

        public InvestmentInsightsController(
            ILogger<InvestmentInsightsController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            IWorkloadClientService workloadClientService,
            ILakehouseClientService lakehouseClientService,
            IEventhouseClientService eventhouseClientService,
            IDataPipelineClientService dataPipelineClientService,
            ICoreClientService coreClientService,
            IInvestmentInsightsClientService investmentInsightsClientService)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _workloadClientService = workloadClientService;
            _lakehouseClientService = lakehouseClientService;
            _eventhouseClientService = eventhouseClientService;
            _dataPipelineClientService = dataPipelineClientService;
            _coreClientService = coreClientService;
            _investmentInsightsClientService = investmentInsightsClientService;
        }

        /// <summary>
        /// Creates the Investment Insights Eventhouse, Eventhouse Database, and executes any DDL in the artifacts.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating success if the Eventhouse was created, or an error response if invalid or an exception occurs.
        /// </returns>
        [HttpPost("{workspaceId:guid}/workload/investmentinsights/eventhouse/create")]
        public async Task<IActionResult> CreateWorkloadInvestmentInsightsEventhouseAsync(Guid workspaceId)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: [WorkloadScopes.FabricWorkspaceReadWriteAll, WorkloadScopes.FabricLakehouseReadWriteAll, WorkloadScopes.EventhouseReadWriteAll, WorkloadScopes.KQLDatabaseReadWriteAll]);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
                var workloadSettingsLakehouse = await _workloadClientService.GetWorkloadSettingsLakehouse(token, workspaceId);

                // Get or create the Eventhouse
                var eventhouse = await _eventhouseClientService.GetEventhouse(token, workspaceId, InvestmentInsightsConstants.EventhouseName) ?? 
                    await _eventhouseClientService.CreateEventhouse(token, workspaceId, InvestmentInsightsConstants.EventhouseName, InvestmentInsightsConstants.EventhouseDescription);

                // Get or create the KQL Database
                var kqlDatabase = await _eventhouseClientService.GetKQLDatabase(token, workspaceId, InvestmentInsightsConstants.EventhouseName) ?? 
                    await _eventhouseClientService.CreateKQLDatabase(token, workspaceId, Guid.Parse(eventhouse.Id), InvestmentInsightsConstants.EventhouseName, InvestmentInsightsConstants.EventhouseDescription);

                // Execute the KQL Database DDL
                foreach (var kqlDatabaseArtifact in InvestmentInsightsConstants.KQLDatabaseDDL)
                {
                    var artifact = Artifacts.GetArtifact(kqlDatabaseArtifact);
                    await _eventhouseClientService.ExecuteControlQuery(token, artifact, connectionString: kqlDatabase.Properties.QueryServiceUri, databaseName: kqlDatabase.DisplayName);
                }

                // Ingest the sample data
                foreach(var sampleDataArtifact in InvestmentInsightsConstants.SampleData)
                {
                    var query = $".ingest into table {sampleDataArtifact.Table} (h'abfss://{workspaceId}@onelake.dfs.fabric.microsoft.com/{workloadSettingsLakehouse.Id}/Files/{sampleDataArtifact.Filename};impersonate')";
                    await _eventhouseClientService.ExecuteControlQuery(token, query, connectionString: kqlDatabase.Properties.QueryServiceUri, databaseName: kqlDatabase.DisplayName);
                }

                return Ok(kqlDatabase);
            }
            catch (HttpRequestException ex)
            {
                return new BadRequestObjectResult(JsonConvert.DeserializeObject<dynamic>(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "unexpected_error", message = ex.Message });
            }
        }

        /// <summary>
        /// Creates any Investment Insights Pipelines defined in the artifacts.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="request">The request containing the Polygon API key.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating success if the Pipeline(s) were created, or an error response if invalid or an exception occurs.
        /// </returns>
        [HttpPost("{workspaceId:guid}/workload/investmentinsights/pipeline/create")]
        public async Task<IActionResult> CreateWorkloadInvestmentInsightsPipelineAsync(Guid workspaceId, [FromBody] APIKeyValidationRequest request)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: [WorkloadScopes.FabricWorkspaceReadWriteAll, WorkloadScopes.FabricLakehouseReadWriteAll, WorkloadScopes.ConnectionReadWriteAll, WorkloadScopes.DataPipelineReadWriteAll]);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
                var kqlDatabase = await _eventhouseClientService.GetKQLDatabase(token, workspaceId, InvestmentInsightsConstants.EventhouseName);

                // Create the Connections
                var connectionDetails = new Connection();
                foreach (var connection in InvestmentInsightsConstants.Connections)
                {
                    var connectionPayload = Artifacts.GetArtifact(connection.Filename);
                    connectionDetails = await _coreClientService.GetConnection(token, connection.Name);
                    if (connectionDetails == null)
                    {
                        connectionDetails = await _coreClientService.CreateConnection(token, connectionPayload);
                    }
                }

                // Create the Data Pipelines if they don't exist
                foreach (var dataPipeline in InvestmentInsightsConstants.DataPipelines)
                {
                    var pipeline = await _dataPipelineClientService.GetDataPipeline(token, workspaceId, dataPipeline.Name);
                    if (pipeline == null)
                    {
                        var dataPipelinePayload = Artifacts.GetArtifact(dataPipeline.Filename)
                            .Replace("{{WORKSPACE_ID}}", workspaceId.ToString())
                            .Replace("{{EVENTHOUSE_ENDPOINT}}", kqlDatabase.Properties.QueryServiceUri)
                            .Replace("{{KQLDATABASE_ID}}", kqlDatabase.Id)
                            .Replace("{{POLYGON_CONNECTION_ID}}", connectionDetails.Id)
                            .Replace("{{POLYGON_API_KEY}}", request.APIKey);
                        await _dataPipelineClientService.CreateDataPipeline(token, workspaceId, dataPipeline.Name, dataPipelinePayload);
                    }
                }

                return new OkResult();
            }
            catch (HttpRequestException ex)
            {
                return new BadRequestObjectResult(JsonConvert.DeserializeObject<dynamic>(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "unexpected_error", message = ex.Message });
            }
        }

        /// <summary>
        /// Validates the provided Polygon API key.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="request">The request containing the API key to validate.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating success if the API key is valid, or an error response if invalid or an exception occurs.
        /// </returns>
        [HttpPost("{workspaceId:guid}/workload/investmentinsights/polygon/validate")]
        public async Task<IActionResult> ValidatePolygonAPIKeyAsync(Guid workspaceId, [FromBody] APIKeyValidationRequest request)
        {
            try
            {
                var validationResponse = await _investmentInsightsClientService.ValidatePolygonIOAPIKey(request.APIKey);
                if (validationResponse)
                {
                    return new OkObjectResult(new { result = "success" });
                }
                else
                {
                    return new BadRequestObjectResult(new { error = "invalid_api_key" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "unexpected_error", message = ex.Message });
            }
        }
    }
}