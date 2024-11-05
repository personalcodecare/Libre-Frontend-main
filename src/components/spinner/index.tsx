import Image from 'next/image'

import SpinnerIcon from 'assets/images/spinner.gif'

export const Spinner = () => {
  return <Image src={SpinnerIcon} alt="Loading" width={88} height={88} />
}
