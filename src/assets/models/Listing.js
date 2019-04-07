import Model from 'ln-radiks/lib/model'

export default class Listing extends Model {
  static className = 'Listing'

  static schema = {
    name: {
      type: String,
      decrypted: true
    },
    location: {
      type: String,
      decrypted: true
    },
    capacity: {
      type: Number,
      decrypted: true
    },
    currency: {
      type: String,
      decrypted: true
    },
    type: {
      type: String,
      decrypted: true
    },
    createdBy: {
      type: String,
      decrypted: true
    }
  }
}
