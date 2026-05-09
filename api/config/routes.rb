Rails.application.routes.draw do
  # ── Health check ──────────────────────────────────────────────────────────
  get "/health", to: proc { [200, { "Content-Type" => "application/json" }, ['{"status":"ok"}']] }

  # ── Public API v1 ─────────────────────────────────────────────────────────
  namespace :api do
    namespace :v1 do
      # Products (read-only)
      resources :products, only: [:index, :show]

      # Guest orders
      resources :orders, only: [:create] do
        member do
          get "/", to: "orders#show"  # GET /api/v1/orders/:reference
        end
      end
      # Allow looking up by reference string
      get "/orders/:id", to: "api/v1/orders#show", as: :order_by_reference

      # Payments
      scope :payments do
        post "/mpesa",    to: "payments#create",   as: :mpesa_payment
        post "/callback", to: "payments#callback", as: :mpesa_callback
      end
    end
  end

  # ── Admin ─────────────────────────────────────────────────────────────────
  namespace :admin do
    # Auth
    scope :auth do
      post   "/login",       to: "auth#login"
      get    "/me",          to: "auth#me"
      patch  "/credentials", to: "auth#update_credentials"
    end

    # Products (full CRUD + image management)
    resources :products do
      member do
        post   :upload_image
        delete :remove_image
        patch  :restock
      end
      collection do
        get :low_stock
      end
    end

    # Orders
    resources :orders, only: [:index, :show] do
      member do
        patch :update_status
        post  :cancel
      end
      collection do
        get :stats
      end
    end
  end
end
