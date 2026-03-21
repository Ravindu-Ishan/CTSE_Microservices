# ============================================================
# myApplication Module
#
# Sets up:
#   1. Resource Explorer — indexes all resources so AWS can
#      discover and display them in the console
#   2. AppRegistry Application — the myApplications entry
#      visible at AWS Console → myApplications
#   3. Attribute Group — metadata attached to the application
#   4. Tag association — auto-includes any resource tagged
#      Project=OTSS into the application view
#
# After applying, go to:
#   AWS Console → myApplications → otss-staging
# ============================================================

# ----------------------------------------------------------------
# Resource Explorer — required for myApplications to discover
# resources. Without this, the application shows 0 resources.
# ----------------------------------------------------------------
resource "aws_resourceexplorer2_index" "main" {
  type = "LOCAL"

  tags = {
    Name = "${var.name_prefix}-resource-index"
  }
}

resource "aws_resourceexplorer2_view" "main" {
  name         = "${var.name_prefix}-view"
  default_view = true

  # Include tags in search results so filtering by Project=OTSS works
  included_property {
    name = "tags"
  }

  depends_on = [aws_resourceexplorer2_index.main]
}

# ----------------------------------------------------------------
# AppRegistry Application — this is what appears in myApplications
# ----------------------------------------------------------------
resource "aws_servicecatalogappregistry_application" "main" {
  name        = "${var.name_prefix}-app"
  description = "OTSS Online Ticketing Support System — ${var.environment}"

  tags = {
    Name = "${var.name_prefix}-app"
  }
}

# ----------------------------------------------------------------
# Attribute Group — metadata about the application
# Visible in the myApplications detail view
# ----------------------------------------------------------------
resource "aws_servicecatalogappregistry_attribute_group" "main" {
  name        = "${var.name_prefix}-attrs"
  description = "OTSS application metadata"

  attributes = jsonencode({
    project     = var.project
    environment = var.environment
    region      = var.aws_region
    repo        = "Ravindu-Ishan/CTSE_Microservices"
    stack       = "NestJS + WSO2 IS + WSO2 APIM + PostgreSQL"
  })
}

resource "aws_servicecatalogappregistry_attribute_group_association" "main" {
  application_id     = aws_servicecatalogappregistry_application.main.id
  attribute_group_id = aws_servicecatalogappregistry_attribute_group.main.id
}
