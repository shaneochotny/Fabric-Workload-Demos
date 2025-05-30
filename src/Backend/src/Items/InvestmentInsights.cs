// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using Boilerplate.Services;
using Boilerplate.Utils;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace Boilerplate.Items
{
    public class InvestmentInsights : ItemBase<InvestmentInsights, InvestmentInsightsMetadata, InvestmentInsightsClientMetadata>, IInvestmentInsights
    {
        private static readonly IList<string> OneLakeScopes = new[] { $"{EnvironmentConstants.OneLakeResourceId}/.default" };

        private static readonly IList<string> FabricScopes = new[] { $"{EnvironmentConstants.FabricBackendResourceId}/Lakehouse.Read.All" };

        private readonly ILakehouseClientService _lakeHouseClientService;

        private readonly IAuthenticationService _authenticationService;

        private InvestmentInsightsMetadata _metadata;

        public InvestmentInsights(
            ILogger<InvestmentInsights> logger,
            IItemMetadataStore itemMetadataStore,
            ILakehouseClientService lakeHouseClientService,
            IAuthenticationService authenticationService,
            AuthorizationContext authorizationContext)
            : base(logger, itemMetadataStore, authorizationContext)
        {
            _lakeHouseClientService = lakeHouseClientService;
            _authenticationService = authenticationService;
        }

        public override string ItemType => WorkloadConstants.ItemTypes.InvestmentInsights;

        public ItemReference Lakehouse => Metadata.Lakehouse;

        public override async Task<ItemPayload> GetItemPayload()
        {
            var typeSpecificMetadata = GetTypeSpecificMetadata();

            FabricItem lakehouseItem = null;
            if (typeSpecificMetadata.Lakehouse.Id != Guid.Empty)
            {
                try
                {
                    var token = await _authenticationService.GetAccessTokenOnBehalfOf(AuthorizationContext, FabricScopes);
                    lakehouseItem = await _lakeHouseClientService.GetFabricLakehouse(token, typeSpecificMetadata.Lakehouse.WorkspaceId, typeSpecificMetadata.Lakehouse.Id);
                }
                catch (Exception ex)
                {
                    Logger.LogError($"Failed to retrieve FabricLakehouse for lakehouse: {typeSpecificMetadata.Lakehouse.Id} in workspace: {typeSpecificMetadata.Lakehouse.WorkspaceId}. Error: {ex.Message}");
                }
            }

            return new ItemPayload
            {
                InvestmentInsightsMetadata = typeSpecificMetadata.ToClientMetadata(lakehouseItem)
            };
        }

        public override async Task ExecuteJob(string jobType, Guid jobInstanceId, JobInvokeType invokeType, CreateItemJobInstancePayload creationPayload)
        {
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(AuthorizationContext, OneLakeScopes);
        }

        public override async Task<ItemJobInstanceState> GetJobState(string jobType, Guid jobInstanceId)
        {
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(AuthorizationContext, OneLakeScopes);

            var filePath = GetLakehouseFilePath(jobType, jobInstanceId);
            var fileExists = await _lakeHouseClientService.CheckIfFileExists(token, filePath);

            return new ItemJobInstanceState
            {
                Status = fileExists ? JobInstanceStatus.Completed : JobInstanceStatus.InProgress,
            };
        }

        private string GetLakehouseFilePath(string jobType, Guid jobInstanceId)
        {
            var typeToFileName = new Dictionary<string, string>
            {
                { Item1JobType.ScheduledJob, $"CalculationResult_{jobInstanceId}.txt" },
                { Item1JobType.CalculateAsText, $"CalculationResult_{jobInstanceId}.txt" },
                { Item1JobType.CalculateAsParquet, $"CalculationResult_{jobInstanceId}.parquet" }
            };
            typeToFileName.TryGetValue(jobType, out var fileName);

            if (fileName != null)
            {
                return $"{_metadata.Lakehouse.WorkspaceId}/{_metadata.Lakehouse.Id}/Files/{fileName}";
            }
            throw new NotSupportedException("Workload job type is not supported");
        }

        private InvestmentInsightsMetadata Metadata => Ensure.NotNull(_metadata, "The item object must be initialized before use");

        protected override void SetDefinition(CreateItemPayload payload)
        {
            if (payload == null)
            {
                Logger.LogInformation("No payload is provided for {0}, objectId={1}", ItemType, ItemObjectId);
                _metadata = InvestmentInsightsMetadata.Default.Clone();
                return;
            }

            if (payload.InvestmentInsightsMetadata == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId);
            }

            if (payload.InvestmentInsightsMetadata.Lakehouse == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId)
                    .WithDetail(ErrorCodes.ItemPayload.MissingLakehouseReference, "Missing Lakehouse reference");
            }

            _metadata = payload.InvestmentInsightsMetadata.Clone();
        }

        protected override void UpdateDefinition(UpdateItemPayload payload)
        {
            if (payload == null)
            {
                Logger.LogInformation("No payload is provided for {0}, objectId={1}", ItemType, ItemObjectId);
                return;
            }

            if (payload.InvestmentInsightsMetadata == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId);
            }

            if (payload.InvestmentInsightsMetadata.Lakehouse == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId)
                    .WithDetail(ErrorCodes.ItemPayload.MissingLakehouseReference, "Missing Lakehouse reference");
            }

            SetTypeSpecificMetadata(payload.InvestmentInsightsMetadata);
        }

        protected override void SetTypeSpecificMetadata(InvestmentInsightsMetadata itemMetadata)
        {
            _metadata = itemMetadata.Clone();
        }

        protected override InvestmentInsightsMetadata GetTypeSpecificMetadata()
        {
            return Metadata.Clone();
        }
    }
}
