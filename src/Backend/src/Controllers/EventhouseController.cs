// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Services;
using Kusto.Data;
using Kusto.Data.Net.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using System.Net.Http;

namespace Boilerplate.Controllers
{
    [ApiController]
    public class EventhouseController : ControllerBase
    {
        private static readonly IList<string> FabricAPIScopes = [$"{EnvironmentConstants.FabricApiBaseUrl}/.default"];
        private static readonly IList<string> ScopesForReadLakehouseFile = [WorkloadScopes.FabricLakehouseReadAll, WorkloadScopes.FabricLakehouseReadWriteAll];
        private static readonly IList<string> ScopesForWriteEventhouse = [WorkloadScopes.FabricWorkspaceReadWriteAll, WorkloadScopes.FabricLakehouseReadWriteAll, WorkloadScopes.EventhouseReadWriteAll, WorkloadScopes.KQLDatabaseReadWriteAll];

        private readonly ILogger<EventhouseController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly IEventhouseClientService _eventhouseClientService;

        public EventhouseController(
            ILogger<EventhouseController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            IEventhouseClientService eventhouseClientService)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _eventhouseClientService = eventhouseClientService;
        }

        /// <summary>
        /// Gets the details of a provided Eventhouse in the specified Workspace.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="eventhouseIdOrName">The Name or GUID of the Eventhouse.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> with Eventhouse details.
        /// </returns>
        [HttpGet("{workspaceId}/eventhouses/{eventhouseIdOrName}/get")]
        public async Task<IActionResult> GetEventhouseAsync(Guid workspaceId, string eventhouseIdOrName)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteEventhouse);
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
            var eventhouse = _eventhouseClientService.GetEventhouse(token, workspaceId, eventhouseIdOrName);

            if (eventhouse == null)
            {
                return Ok(new { error = "does_not_exist" });
            }

            return Ok(eventhouse);
        }

        /// <summary>
        /// Creates a new Eventhouse in the specified Workspace.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="request">ItemCreateRequest with the new Eventhouse options.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> with the new Eventhouse details, or an error response if invalid or an exception occurs.
        /// </returns>
        [HttpPost("{workspaceId:guid}/eventhouses/create")]
        public async Task<IActionResult> CreateEventhouseAsync(Guid workspaceId, [FromBody] ItemCreateRequest request)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteEventhouse);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
                var createEventhouseResponse = await _eventhouseClientService.CreateEventhouse(token, workspaceId, request.DisplayName, request.Description);

                return Ok(createEventhouseResponse);
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
        /// Gets the details of a provided Eventhouse Database in the specified Workspace.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="eventhouseIdOrName">The Name or GUID of the Eventhouse Database.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> with Eventhouse details.
        /// </returns>
        [HttpGet("{workspaceId:guid}/eventhouses/databases/{databaseIdOrName}/get")]
        public async Task<IActionResult> GetKQLDatabaseAsync(Guid workspaceId, string databaseIdOrName)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteEventhouse);
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
            var kqlDatabase = await _eventhouseClientService.GetKQLDatabase(token, workspaceId, databaseIdOrName);

            if (kqlDatabase == null)
            {
                return Ok(new { error = "does_not_exist" });
            }

            return Ok(kqlDatabase);
        }

        /// <summary>
        /// Creates a new Eventhouse Database in the specified Workspace.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="eventhouseId">The parent Eventhouse ID associated with the request.</param>
        /// <param name="request">ItemCreateRequest with the new Eventhouse Database options.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> with the new Eventhouse Database details, or an error response if invalid or an exception occurs.
        /// </returns>
        [HttpPost("{workspaceId:guid}/eventhouses/{eventhouseId:guid}/databases/create")]
        public async Task<IActionResult> CreateKQLDatabaseAsync(Guid workspaceId, Guid eventhouseId, [FromBody] ItemCreateRequest request)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteEventhouse);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
                var createEventhouseResponse = await _eventhouseClientService.CreateKQLDatabase(token, workspaceId, eventhouseId, request.DisplayName, request.Description);

                return Ok(createEventhouseResponse);
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
        /// Executes an Eventhouse Database query.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="eventhouseId">The Name or GUID of the Eventhouse.</param>
        /// <param name="databaseId">The Name or GUID of the Eventhouse Database.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> with query results.
        /// </returns>
        [HttpGet("{workspaceId:guid}/eventhouses/{eventhouseId:guid}/databases/{databaseId:guid}/query")]
        public async Task<IActionResult> Query(Guid workspaceId, Guid eventhouseId, Guid databaseId, [FromQuery] string databaseName, [FromQuery] string query, [FromQuery] string connectionString)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteEventhouse);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);

                if (String.IsNullOrEmpty(databaseName) || String.IsNullOrEmpty(connectionString))
                {
                    var kqlDatabase = await _eventhouseClientService.GetKQLDatabase(token, workspaceId, databaseId.ToString());
                    databaseName = kqlDatabase.DisplayName;
                    connectionString = kqlDatabase.Properties.QueryServiceUri;
                }

                var queryResults = await _eventhouseClientService.ExecuteQuery(token, query, connectionString, databaseName);

                return new OkObjectResult(queryResults);
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
        /// Gets the tables and row counts in an Eventhouse Database.
        /// </summary>
        /// <param name="workspaceId">The workspace ID associated with the request.</param>
        /// <param name="eventhouseId">The GUID of the Eventhouse.</param>
        /// <param name="databaseId">The GUID of the Eventhouse Database.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> with table results.
        /// </returns>
        [HttpGet("{workspaceId:guid}/eventhouses/{eventhouseId:guid}/databases/{databaseId:guid}/tables")]
        public async Task<IActionResult> GetKQLDatabaseTablesAsync(Guid workspaceId, Guid eventhouseId, Guid databaseId)
        {
            try
            {
                var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteEventhouse);
                var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, FabricAPIScopes);
                var tableResults = await _eventhouseClientService.ExecuteQuery(token, ".show tables details | project TableName, Rows=HotRowCount", workspaceId.ToString(), databaseId.ToString());

                return new OkObjectResult(tableResults);
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