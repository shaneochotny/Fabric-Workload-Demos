// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    public class Connections
    {
        public List<Connection> Value { get; init; }
        public string ContinuationToken { get; init; }
        public string ContinuationUri { get; init; }
    }

    public class Connection
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
        public string GatewayId { get; init; }
        public string ConnectivityType { get; init; }
        public string WorkspaceId { get; init; }
        public ConnectionDetails ConnectionDetails { get; init; }
        public string PrivacyLevel { get; init; }
        public CredentialDetails CredentialDetails { get; init; }
    }

    public class ConnectionDetails
    {
        public string Type { get; init; }
        public string Path { get; init; }
    }

    public class CredentialDetails
    {
        public string CredentialType { get; init; }
        public string SingleSignOnType { get; init; }
        public string ConnectionEncryption { get; init; }
        public bool SkipTestConnection { get; init; }
    }
}