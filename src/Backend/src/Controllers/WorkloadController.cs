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
    public class WorkloadController : ControllerBase
    {
        private static readonly IList<string> OneLakeScopes = [$"{EnvironmentConstants.OneLakeResourceId}/.default"];
        private static readonly IList<string> FabricAPIScopes = [$"{EnvironmentConstants.FabricApiBaseUrl}/.default"];
        private static readonly IList<string> ScopesForWriteLakehouseFile = [WorkloadScopes.FabricLakehouseReadWriteAll];
        private static readonly IList<string> ScopesForWriteWorkspace = [WorkloadScopes.FabricWorkspaceReadWriteAll, WorkloadScopes.FabricLakehouseReadWriteAll, WorkloadScopes.LakehouseReadWriteAll, WorkloadScopes.KQLDatabaseReadWriteAll];

        private readonly ILogger<WorkloadController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly IWorkloadClientService _workloadClientService;
        private readonly ILakehouseClientService _lakehouseClientService;
        private readonly IEventhouseClientService _eventhouseClientService;
        private readonly IDataPipelineClientService _dataPipelineClientService;
        private readonly ICoreClientService _coreClientService;

        public WorkloadController(
            ILogger<WorkloadController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            IWorkloadClientService workloadClientService,
            ILakehouseClientService lakehouseClientService,
            IEventhouseClientService eventhouseClientService,
            IDataPipelineClientService dataPipelineClientService,
            ICoreClientService coreClientService)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _workloadClientService = workloadClientService;
            _lakehouseClientService = lakehouseClientService;
            _eventhouseClientService = eventhouseClientService;
            _dataPipelineClientService = dataPipelineClientService;
            _coreClientService = coreClientService;
        }

        [HttpGet("{workspaceId:guid}/workload/settings")]
        public async Task<IActionResult> GetWorkloadSettingsAsync(Guid workspaceId)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteWorkspace);
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
            var oneLakeToken = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, OneLakeScopes);

            // Check if the WorkloadSettings Lakehouse exists
            var workloadSettingsLakehouse = await _workloadClientService.GetWorkloadSettingsLakehouse(token, workspaceId);

            // If the WorkloadSettings Lakehouse does not exist
            if (workloadSettingsLakehouse == null)
            {
                return Ok(new { hasWorkloadSettingsLakehouse = false });
            }

            // Attempt to read the settings JSON file
            var settingsFilePath = $"{workloadSettingsLakehouse.WorkspaceId}/{workloadSettingsLakehouse.Id}/Files/InvestmentInsights.Settings.json";
            var appSettings = await _lakehouseClientService.GetLakehouseFile(oneLakeToken, settingsFilePath);

            // If the settings JSON file does not exist or is empty
            if (appSettings == string.Empty)
            {
                return Ok(new { hasWorkloadSettingsJSON = false });
            }
            
            return Ok(appSettings);
        }

        [HttpGet("{workspaceId:guid}/workload/settings/lakehouse")]
        public async Task<IActionResult> GetWorkloadSettingsLakehouseAsync(Guid workspaceId)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteWorkspace);
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);

            // Check if the WorkloadSettings Lakehouse exists
            var workloadSettingsLakehouse = await _workloadClientService.GetWorkloadSettingsLakehouse(token, workspaceId);

            if (workloadSettingsLakehouse == null)
            {
                return Ok(new { error = "does_not_exist" });
            }

            return Ok(workloadSettingsLakehouse);
        }

        [HttpPost("{workspaceId:guid}/workload/settings/lakehouse/create")]
        public async Task<IActionResult> CreateWorkloadSettingsLakehouseAsync(Guid workspaceId)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteWorkspace);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
                var oneLakeToken = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, OneLakeScopes);

                // Check if the WorkloadSettings Lakehouse exists
                var workloadSettingsLakehouse = await _workloadClientService.GetWorkloadSettingsLakehouse(token, workspaceId);
                ItemCreateResponse createLakehouseResponse = new();

                // Create the WorkloadSettings Lakehouse if it doesn't exist
                if (workloadSettingsLakehouse == null)
                {
                    createLakehouseResponse = await _lakehouseClientService.CreateLakehouse(token, workspaceId, "WorkloadSettings", "WorkloadSettings Lakehouse");
                }

                // Copy sample data to the Lakehouse
                foreach(var sampleDataArtifact in InvestmentInsightsConstants.SampleData)
                {
                    var artifact = Artifacts.GetArtifact(sampleDataArtifact.Filename);
                    await _lakehouseClientService.WriteToLakehouseFile(oneLakeToken, $"{workspaceId}/{createLakehouseResponse.Id}/Files/{sampleDataArtifact.Filename}", artifact);
                }

                return Ok(createLakehouseResponse);
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
    }
}