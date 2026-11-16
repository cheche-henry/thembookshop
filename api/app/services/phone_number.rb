# Normalises Kenyan mobile numbers so the same customer number always has one
# representation, whether it arrives as 0712 345 678, +254712345678 or 254712345678.
module PhoneNumber
  KENYAN_MOBILE = /\A254[17]\d{8}\z/

  module_function

  def normalize(value)
    digits = value.to_s.gsub(/\D/, "")

    if digits.start_with?("0") && digits.length == 10
      "254#{digits[1..]}"
    elsif digits.start_with?("254")
      digits
    elsif digits.length == 9
      "254#{digits}"
    else
      digits
    end
  end

  def valid?(value)
    normalize(value).match?(KENYAN_MOBILE)
  end

  # Display form used in emails/admin UI: 0712 345 678
  def local(value)
    digits = normalize(value)
    return value.to_s unless digits.match?(KENYAN_MOBILE)

    "0#{digits[3..]}"
  end
end
