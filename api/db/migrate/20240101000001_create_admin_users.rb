class CreateAdminUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :admin_users do |t|
      t.string  :email,           null: false
      t.string  :password_digest, null: false
      t.string  :name,            null: false
      t.string  :phone
      t.boolean :active,          default: true, null: false
      t.datetime :last_login_at
      t.string  :last_login_ip

      t.timestamps
    end
    add_index :admin_users, :email, unique: true
  end
end
