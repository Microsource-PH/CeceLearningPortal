using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CeceLearningPortal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceHub : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "resource_activity_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    target_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    target_id = table.Column<Guid>(type: "uuid", nullable: true),
                    payload_json = table.Column<string>(type: "text", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    user_agent = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resource_activity_logs", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resource_activity_logs__asp_net_users_actor_user_id",
                        column: x => x.actor_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "resource_hub_about",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    hero_image_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    cta_buttons_json = table.Column<string>(type: "text", nullable: false),
                    last_edited_by_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resource_hub_about", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resource_hub_about__asp_net_users_last_edited_by_id",
                        column: x => x.last_edited_by_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "resource_sections",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    access = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    icon_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resource_sections", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "resource_tags",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    usage_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resource_tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    headline = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    about = table.Column<string>(type: "text", nullable: false),
                    skills = table.Column<string>(type: "text", nullable: false),
                    location_city = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    location_country = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    time_zone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    languages = table.Column<string>(type: "text", nullable: false),
                    photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    portfolio_links_json = table.Column<string>(type: "text", nullable: false),
                    linked_in_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    twitter_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    facebook_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    website_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    git_hub_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    availability = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    services = table.Column<string>(type: "text", nullable: false),
                    hourly_rate = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    certifications_json = table.Column<string>(type: "text", nullable: false),
                    consent_public_listing = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    rejection_reason = table.Column<string>(type: "text", nullable: false),
                    approved_by_id = table.Column<string>(type: "text", nullable: false),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    profile_views = table.Column<int>(type: "integer", nullable: false),
                    contact_clicks = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_student_profiles", x => x.id);
                    table.ForeignKey(
                        name: "FK_student_profiles_AspNetUsers_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_student_profiles_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resources",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    slug = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    summary = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    external_url = table.Column<string>(type: "text", nullable: false),
                    thumbnail_url = table.Column<string>(type: "text", nullable: false),
                    section_id = table.Column<Guid>(type: "uuid", nullable: false),
                    access = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    owner_user_id = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    replaces_resource_id = table.Column<Guid>(type: "uuid", nullable: true),
                    meta_title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    meta_description = table.Column<string>(type: "text", nullable: false),
                    open_graph_image = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    views = table.Column<int>(type: "integer", nullable: false),
                    downloads = table.Column<int>(type: "integer", nullable: false),
                    bookmarks = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: true),
                    mime_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    duration = table.Column<int>(type: "integer", nullable: true),
                    page_count = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resources", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resources__asp_net_users_owner_id",
                        column: x => x.owner_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_resources__resource_sections_section_id",
                        column: x => x.section_id,
                        principalTable: "resource_sections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_resources_resources_replaces_resource_id",
                        column: x => x.replaces_resource_id,
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "file_assets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    original_filename = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    mime_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    size = table.Column<long>(type: "bigint", nullable: false),
                    checksum = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    cdn_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    owner_user_id = table.Column<string>(type: "text", nullable: false),
                    resource_id = table.Column<Guid>(type: "uuid", nullable: true),
                    upload_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    error_message = table.Column<string>(type: "text", nullable: false),
                    metadata_json = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_file_assets", x => x.id);
                    table.ForeignKey(
                        name: "f_k_file_assets__asp_net_users_owner_id",
                        column: x => x.owner_user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_file_assets__resources_resource_id",
                        column: x => x.resource_id,
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resource_bookmarks",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    resource_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resource_bookmarks", x => new { x.user_id, x.resource_id });
                    table.ForeignKey(
                        name: "f_k_resource_bookmarks__asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_resource_bookmarks_resources_resource_id",
                        column: x => x.resource_id,
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resource_comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    resource_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    parent_comment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    is_edited = table.Column<bool>(type: "boolean", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resource_comments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resource_comments__asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_resource_comments_resource_comments_parent_comment_id",
                        column: x => x.parent_comment_id,
                        principalTable: "resource_comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_resource_comments_resources_resource_id",
                        column: x => x.resource_id,
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resource_resource_tags",
                columns: table => new
                {
                    resource_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tag_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resource_resource_tags", x => new { x.resource_id, x.tag_id });
                    table.ForeignKey(
                        name: "f_k_resource_resource_tags__resource_tags_tag_id",
                        column: x => x.tag_id,
                        principalTable: "resource_tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_resource_resource_tags_resources_resource_id",
                        column: x => x.resource_id,
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "i_x_file_assets_resource_id",
                table: "file_assets",
                column: "resource_id");

            migrationBuilder.CreateIndex(
                name: "IX_file_assets_owner_user_id",
                table: "file_assets",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_file_assets_storage_key",
                table: "file_assets",
                column: "storage_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_resource_activity_logs_actor_user_id",
                table: "resource_activity_logs",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resource_bookmarks_resource_id",
                table: "resource_bookmarks",
                column: "resource_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resource_comments_parent_comment_id",
                table: "resource_comments",
                column: "parent_comment_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resource_comments_resource_id",
                table: "resource_comments",
                column: "resource_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resource_comments_user_id",
                table: "resource_comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resource_hub_about_last_edited_by_id",
                table: "resource_hub_about",
                column: "last_edited_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resource_resource_tags_tag_id",
                table: "resource_resource_tags",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "IX_resource_sections_slug",
                table: "resource_sections",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_resource_tags_slug",
                table: "resource_tags",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_resources_replaces_resource_id",
                table: "resources",
                column: "replaces_resource_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resources_section_id",
                table: "resources",
                column: "section_id");

            migrationBuilder.CreateIndex(
                name: "IX_resources_owner_user_id",
                table: "resources",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_resources_slug",
                table: "resources",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_student_profiles_approved_by_id",
                table: "student_profiles",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_profiles_user_id",
                table: "student_profiles",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "file_assets");

            migrationBuilder.DropTable(
                name: "resource_activity_logs");

            migrationBuilder.DropTable(
                name: "resource_bookmarks");

            migrationBuilder.DropTable(
                name: "resource_comments");

            migrationBuilder.DropTable(
                name: "resource_hub_about");

            migrationBuilder.DropTable(
                name: "resource_resource_tags");

            migrationBuilder.DropTable(
                name: "student_profiles");

            migrationBuilder.DropTable(
                name: "resource_tags");

            migrationBuilder.DropTable(
                name: "resources");

            migrationBuilder.DropTable(
                name: "resource_sections");
        }
    }
}
