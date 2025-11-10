// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SugarFlag",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "SugarFlag",
            targets: ["SugarFlag"]),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "SugarFlag",
            dependencies: [],
            path: "Sources"),
        .testTarget(
            name: "SugarFlagTests",
            dependencies: ["SugarFlag"],
            path: "Tests"),
    ]
)
