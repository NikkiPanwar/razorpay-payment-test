import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var Razorpay: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Test Key: Replace with your actual key from https://dashboard.razorpay.com/app/keys
  razorpayKey: string = 'rzp_test_1DP5mmOlF5G5ag';
  amount: number = 100; // in INR

  paymentId: string = '';
  status: string = '';

  constructor(private ngZone: NgZone) {}

  payNow(): void {
    if (typeof Razorpay === 'undefined') {
      alert('Razorpay SDK not loaded. Check index.html script tag.');
      return;
    }

    const options = {
      key: this.razorpayKey.trim(),
      amount: this.amount * 100, // Amount in paise (e.g., 100 INR = 10000 paise)
      currency: 'INR',
      name: 'Dummy Store',
      description: 'Test Razorpay Transaction',
      prefill: {
        name: 'Test User',
        email: 'test@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#2563eb'
      },
      handler: (response: any) => {
        // Runs when payment is successful
        this.ngZone.run(() => {
          this.paymentId = response.razorpay_payment_id;
          this.status = 'Payment Successful!';
        });
      },
      modal: {
        ondismiss: () => {
          // Runs if user closes the popup
          this.ngZone.run(() => {
            if (!this.paymentId) {
              this.status = 'Payment popup was closed.';
            }
          });
        }
      }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      this.ngZone.run(() => {
        this.paymentId = '';
        this.status = 'Payment Failed: ' + (response.error?.description || 'Unknown error');
      });
    });

    rzp.open();
  }
}
