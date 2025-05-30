// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    /// <summary>
    /// Generic Fabric API response for creating a Fabric item such as a Lakehouse 
    /// or Eventhouse
    /// </summary>
    public class ItemCreateResponse
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
        public string Description { get; init; }
        public string WorkspaceId { get; init; }
        public string Type { get; init; }
    }
}