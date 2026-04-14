Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :products, only: [:index, :show]
      resources :orders, only: [:create]

      namespace :admin do
        post '/login', to: 'auth#login'
        resources :products, except: [:show, :edit, :new]
        resources :orders, only: [:index] do
          patch :update_status, on: :member
        end
      end

      # ✅ FIXED
      post 'payments/stk_push', to: 'payments#stk_push'
      post 'payments/mpesa_callback', to: 'payments#mpesa_callback'
    end
  end
end