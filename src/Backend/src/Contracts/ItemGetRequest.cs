// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    /// <summary>
    /// Generic Workload API POST request for getting an Item based on
    /// the Id (guid) or Name.
    /// </summary>
    public class ItemGetRequest
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
    }
}