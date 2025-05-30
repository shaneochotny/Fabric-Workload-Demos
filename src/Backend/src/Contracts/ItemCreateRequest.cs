// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    /// <summary>
    /// Generic Workload API POST request for creating an Item
    /// </summary>
    public class ItemCreateRequest
    {
        public string DisplayName { get; init; }
        public string Description { get; init; }
    }
}