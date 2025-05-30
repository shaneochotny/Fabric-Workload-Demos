// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.IO;
using System.Reflection;
using Microsoft.Extensions.FileProviders;

namespace Boilerplate.Utils
{
    public static class Artifacts
    {
        /// <summary>
        /// Return the content from the embedded resource file.
        /// </summary>
        /// <param name="filename"></param>
        /// <returns>Query string</returns>
        public static string GetArtifact (string filename)
        {
            var embeddedProvider = new EmbeddedFileProvider(Assembly.GetExecutingAssembly());
            using var reader = embeddedProvider.GetFileInfo($"Artifacts/{filename}").CreateReadStream();
            using var sr = new StreamReader(reader);
            var content = sr.ReadToEnd();
            return content;
        }
    }
}
